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

// Verified models available for the user's specific key
const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite-001',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

const API_VERSIONS = ['v1', 'v1beta'];

/**
 * Robust fetch-based Gemini API caller with automatic fallback
 */
async function callGeminiAPI(payload, options = {}, modelIndex = 0, versionIndex = 0) {
  const apiKey = getApiKey()?.trim();
  if (!apiKey) throw new Error("Missing Gemini API Key.");

  const model = MODELS[modelIndex];
  const version = API_VERSIONS[versionIndex];
  const baseUrl = import.meta.env.DEV ? '/gemini-api' : 'https://generativelanguage.googleapis.com';
  
  console.log(`[AI] Requesting ${model} (${version}) [Attempt ${modelIndex + 1}/${MODELS.length}]`);

  try {
    const response = await fetch(`${baseUrl}/${version}/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Check for empty response
    const textRes = await response.text();
    let data;
    try {
      data = JSON.parse(textRes);
    } catch (e) {
      throw new Error(`Invalid JSON response from ${model}`);
    }

    if (!response.ok) {
      const errorMsg = data.error?.message || response.statusText || "Unknown error";
      console.warn(`[AI] ${model} (${version}) failed:`, errorMsg);
      
      // If it's a 404, the model/version combo doesn't exist.
      // If it's a 429, we hit the quota. 
      // In both cases, try the next version or next model.
      
      // Try next version for the same model
      if (versionIndex < API_VERSIONS.length - 1) {
        return await callGeminiAPI(payload, options, modelIndex, versionIndex + 1);
      }
      // Try next model
      if (modelIndex < MODELS.length - 1) {
        return await callGeminiAPI(payload, options, modelIndex + 1, 0);
      }
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.warn(`[AI] Request error for ${model}:`, error.message);
    // If we have more models to try, move on
    if (modelIndex < MODELS.length - 1) {
      return await callGeminiAPI(payload, options, modelIndex + 1, 0);
    }
    throw error;
  }
}

// Helper to extract JSON from markdown code blocks
const extractJSON = (text) => {
  if (!text) return null;
  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  
  const sanitize = (str) => {
    return str.replace(/\\(?![/"\\bfnrtu])/g, '');
  };

  try {
    return JSON.parse(cleaned);
  } catch (initialError) {
    try {
      return JSON.parse(sanitize(cleaned));
    } catch (secondError) {
      const startIndex = cleaned.indexOf('{');
      const endIndex = cleaned.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        const boundingJson = cleaned.substring(startIndex, endIndex + 1);
        return JSON.parse(sanitize(boundingJson));
      }
    }
    throw new Error(`LLM returned invalid JSON: ${initialError.message}`);
  }
};

export const LLMService = {
  async generateLesson(language, skillLevel, completedLessons, weaknesses) {
    const prompt = `You are a world-class, dynamic Senior Polyglot Programming Tutor. 
Analyze the student's context: ${language}, ${skillLevel}, completed: ${completedLessons.join(', ')}.
Generate a JSON lesson object: {id, title, concept, explanation, task, initialCode}.
Output ONLY JSON. Use standard JSON escaping.`;

    const data = await callGeminiAPI({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return extractJSON(text);
  },

  async assessCode(language, lessonTask, userCode, executionOutput) {
    const prompt = `Assess the student's code. 
Task: ${lessonTask}
Code: ${userCode}
Output: ${executionOutput}
Output ONLY JSON: {isPassed, feedback, newWeaknesses}. Use standard JSON escaping.`;

    const data = await callGeminiAPI({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return extractJSON(text);
  },

  async chatWithAgent(chatHistory, currentLesson, codeContext) {
    const systemInstruction = `You are 'Code Companion', a supportive programming tutor. 
Currently working on: ${currentLesson?.title || 'coding'}. 
Code Context: ${codeContext}`;

    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Hello! I am your Code Companion. How can I help?' }] },
      ...chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    const data = await callGeminiAPI({ contents });
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  },

  async simulateExecution(language, code) {
    const prompt = `Simulate raw terminal output for this ${language} code: ${code}. Output ONLY the raw terminal output.`;
    const data = await callGeminiAPI({ contents: [{ parts: [{ text: prompt }] }] });
    let output = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (output.startsWith('\`\`\`')) {
      output = output.replace(/^```.*?\n/, '').replace(/\n```$/, '');
    }
    return { output, error: '', code: 0 };
  },

  async checkConnection() {
    try {
      const data = await callGeminiAPI({
        contents: [{ parts: [{ text: "Respond with 'pong'." }] }]
      });
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return { ok: true, message: text };
    } catch (error) {
      console.error("[AI] Health Check Failed:", error);
      return { 
        ok: false, 
        error: error.message,
        isKeyError: error.message.includes("API key") || error.message.includes("403") || error.message.includes("401")
      };
    }
  }
};
