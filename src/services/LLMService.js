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

const MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-2.0-flash-exp'
];

const API_VERSIONS = ['v1', 'v1beta'];

/**
 * Robust fetch-based Gemini API caller with automatic fallback
 */
async function callGeminiAPI(payload, options = {}, modelIndex = 0, versionIndex = 0) {
  const apiKey = getApiKey()?.trim();
  if (!apiKey) {
    throw new Error("Missing Gemini API Key.");
  }

  const model = MODELS[modelIndex];
  const version = API_VERSIONS[versionIndex];
  const baseUrl = import.meta.env.DEV ? '/gemini-api' : 'https://generativelanguage.googleapis.com';
  
  try {
    const response = await fetch(`${baseUrl}/${version}/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      // If we have more versions to try for this model
      if (versionIndex < API_VERSIONS.length - 1) {
        return await callGeminiAPI(payload, options, modelIndex, versionIndex + 1);
      }
      // If we have more models to try
      if (modelIndex < MODELS.length - 1) {
        return await callGeminiAPI(payload, options, modelIndex + 1, 0);
      }
      throw new Error(data.error?.message || `API Error ${response.status}`);
    }

    return data;
  } catch (error) {
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
Output ONLY JSON.`;

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
Output ONLY JSON: {isPassed, feedback, newWeaknesses}.`;

    const data = await callGeminiAPI({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return extractJSON(text);
  },

  async chatWithAgent(chatHistory, currentLesson, codeContext) {
    const systemInstruction = `You are 'Code Companion', a supportive programming tutor. 
Currently working on: ${currentLesson?.title}. 
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
      const apiKey = getApiKey()?.trim();
      const prefix = apiKey ? apiKey.substring(0, 8) : 'MISSING';
      console.log(`[AI Diagnostic] Testing connection with key prefix: ${prefix}...`);
      
      // Step 1: Try to list models (this confirms if the key is valid)
      const baseUrl = import.meta.env.DEV ? '/gemini-api' : 'https://generativelanguage.googleapis.com';
      const modelsRes = await fetch(`${baseUrl}/v1/models?key=${apiKey}`);
      const modelsData = await modelsRes.json();
      
      if (!modelsRes.ok) {
        console.error("[AI Diagnostic] Could not list models. Key might be invalid.", modelsData);
        return { 
          ok: false, 
          error: modelsData.error?.message || "Invalid API Key",
          isKeyError: true 
        };
      }
      
      console.log("[AI Diagnostic] Key is VALID. Available models found:", modelsData.models?.length);

      // Step 2: Try a simple ping
      const data = await callGeminiAPI({
        contents: [{ parts: [{ text: "Respond with 'pong'." }] }]
      });
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return { ok: true, message: text };
    } catch (error) {
      console.error("[AI Diagnostic] Health Check Failed:", error);
      return { 
        ok: false, 
        error: error.message,
        isKeyError: error.message.includes("API key") || error.message.includes("403") || error.message.includes("401")
      };
    }
  }
};
