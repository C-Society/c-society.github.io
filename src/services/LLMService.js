import { GoogleGenAI } from '@google/genai';

// Helper to decode API key if it's encoded in Base64
const getApiKey = () => {
  const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
  const encodedKey = import.meta.env.VITE_GEMINI_API_KEY_B64;
  
  if (encodedKey) {
    try {
      return atob(encodedKey);
    } catch (e) {
      console.error("Failed to decode API key:", e);
    }
  }
  return rawKey || '';
};

// Initialize the API with Vite environment variable (supports plain or B64 encoded)
const ai = new GoogleGenAI({ apiKey: getApiKey() });

const MODEL = 'gemini-1.5-flash';

// Helper to extract JSON from markdown code blocks
const extractJSON = (text) => {
  // Pass 1: Simple cleanup of markdown blocks
  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  
  const sanitize = (str) => {
    // Pass 2: Defensively sanitize common LLM bad escapes (like \[ or \*)
    // We replace any backslash that is NOT part of a valid JSON escape sequence with its character
    // Valid escapes: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
    return str.replace(/\\(?![/"\\bfnrtu])/g, '');
  };

  try {
    return JSON.parse(cleaned);
  } catch (initialError) {
    console.warn("JSON.parse failed on initial text, attempting repair...", initialError);
    
    try {
      // Try sanitizing standard backslash errors
      const repaired = sanitize(cleaned);
      return JSON.parse(repaired);
    } catch (secondError) {
      console.warn("Second-pass JSON parse failed, trying boundary extraction...");
      
      try {
        // Try finding actual { and } boundaries
        const startIndex = cleaned.indexOf('{');
        const endIndex = cleaned.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
          const boundingJson = cleaned.substring(startIndex, endIndex + 1);
          return JSON.parse(sanitize(boundingJson));
        }
      } catch (thirdError) {
        console.error("All JSON parsing attempts failed.", text);
      }
    }
    throw new Error(`LLM returned invalid JSON: ${initialError.message}`);
  }
};

export const LLMService = {
  /**
   * Generates a new lesson based on the user's progress
   */
  async generateLesson(language, skillLevel, completedLessons, weaknesses) {
    const prompt = `You are a world-class, dynamic Senior Polyglot Programming Tutor. 
Your Expertise: Deep mastery of ${language}, but also Python, JavaScript, Java, C++, Rust, Go, PHP, Swift, Kotlin, SQL, and R.
Your Behavior: You provide highly idiomatic, expert-level lessons. For example, if teaching Rust, you emphasize 'memory safety' and 'lifetimes'. If teaching SQL, you emphasize 'joins' and 'normalization'.
Your task is to generate the NEXT lesson for a student based on their current progress and skill level.

Context:
Language: ${language}
Skill Level: ${skillLevel}
Completed Lessons IDs: ${completedLessons.join(', ')}
Student Needs More Practice With: ${weaknesses.join(', ')}

Please output ONLY a JSON object representing the next lesson. Do not output anything else.
The JSON should follow this exact schema:
{
  "id": "unique-lesson-id-str",
  "title": "Lesson Title",
  "concept": "The core concept e.g. For Loops",
  "explanation": "A clear, engaging, and rich markdown-formatted explanation of the concept tailored to their skill level.",
  "task": "A markdown-formatted practice task they need to solve in the editor.",
  "initialCode": "Boilerplate code to start the editor with, if any."
}
Make the lesson highly relevant and engaging. If they are a beginner, start from basics. If they have a weakness, target it.

CRITICAL INSTRUCTION: Output ONLY a valid JSON object. Do NOT wrap your response in markdown code blocks. Do NOT output any additional text. Your entire response must be parsable by JSON.parse(). 
IMPORTANT: Use standard JSON escaping. Do NOT use illegal escapes like \\[ or \\*. All newlines in strings must be escaped as \\n.`;

    const model = ai.getGenerativeModel({ 
      model: MODEL,
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return extractJSON(response.text());
  },

  /**
   * Assesses the student's code.
   */
  async assessCode(language, lessonTask, userCode, executionOutput) {
    const prompt = `You are an intelligent code assessor for a programming tutor.
Task Given to Student: ${lessonTask}
Language: ${language}

Student's Written Code:
\`\`\`${language}
${userCode}
\`\`\`

Execution Output / Errors (from running the code):
\`\`\`
${executionOutput}
\`\`\`

You need to evaluate if the student has successfully completed the task.
Output ONLY a JSON object:
{
  "isPassed": true or false,
  "feedback": "Markdown formatted supportive feedback explaining what they did right, what went wrong, and how to fix syntax or logic errors.",
  "newWeaknesses": ["list", "of", "concepts", "extracted", "if they struggled, else empty"]
}

CRITICAL INSTRUCTION: Output ONLY a valid JSON object. Do NOT wrap your response in markdown code blocks. Do NOT output any additional text. Your entire response must be parsable by JSON.parse(). 
IMPORTANT: Use standard JSON escaping. Do NOT use illegal escapes like \\[ or \\*. All newlines in strings must be escaped as \\n.`;

    const model = ai.getGenerativeModel({ 
      model: MODEL,
      generationConfig: { responseMimeType: 'application/json' }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return extractJSON(response.text());
  },

  /**
   * Conversational chat with context
   */
  async chatWithAgent(chatHistory, currentLesson, codeContext) {
    const systemInstruction = `You are a warm, encouraging, and expert programming tutor named 'Code Companion'.
Your goal is to help the student learn independently. 

The student is currently working on: "${currentLesson?.title || 'a coding task'}" using ${currentLesson?.language || 'programming'}.
Current Code in Editor:
\`\`\`
${codeContext}
\`\`\`

Guidelines:
1. Be concise but extremely supportive. Use phrases like "Great question!", "You're getting closer!", or "Let's look at this together."
2. NEVER give the full solution immediately. Provide a "nudge" or a small hint first.
3. If they have an error, explain WHY it happened in simple terms before suggesting a fix.
4. Use formatting (bolding, code blocks) to make your explanations readable.
5. If the student seems frustrated, acknowledge it and offer a simpler explanation.

Always respond in Markdown.`;

    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Hello! I am your Code Companion. I am ready to help you master programming with encouragement and step-by-step guidance. What is on your mind?' }] },
      ...chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    const model = ai.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent({ contents });
    const response = await result.response;
    return response.text();
  },

  /**
   * Simulates code execution when a real sandbox is unavailable.
   */
  async simulateExecution(language, code) {
    const prompt = `You are a strict, perfectly accurate execution engine for ${language}.
Your task is to simulate running the following code and return the terminal output.

Code:
\`\`\`${language}
${code}
\`\`\`

If there are compilation or runtime errors, output the exact error message that the compiler/interpreter would produce.
If it succeeds, output exactly what the program prints to stdout.
Do NOT include any markdown, explanations, or conversational text. Output ONLY the raw terminal output.`;

    const model = ai.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Clean any stray backticks just in case
    let output = response.text().trim();
    if (output.startsWith('\`\`\`')) {
      output = output.replace(/^```.*?\n/, '').replace(/\n```$/, '');
    }
    
    // We treat everything as output, Assessor will distinguish later
    return { output, error: '', code: 0 };
  },

  /**
   * Checks if the API key is valid and the service is reachable.
   */
  async checkConnection() {
    try {
      const model = ai.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent("Respond with 'pong' if you can hear me.");
      const response = await result.response;
      return { ok: true, message: response.text() };
    } catch (error) {
      console.error("API Health Check Failed:", error);
      return { 
        ok: false, 
        error: error.message,
        isKeyError: error.message.includes("API key") || error.message.includes("403") || error.message.includes("401")
      };
    }
  }
};
