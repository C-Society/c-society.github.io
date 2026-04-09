import { LLMService } from './LLMService';

/**
 * Since the public Piston API was whitelisted starting 2/15/2026,
 * we are utilizing Gemini to accurately simulate the terminal execution output.
 */

// Map our user-friendly language names to Piston language identifiers and versions
const LANGUAGE_MAP = {
  'Python': { language: 'python', version: '3.10.0' },
  'JavaScript': { language: 'javascript', version: '18.15.0' },
  'Java': { language: 'java', version: '15.0.2' },
  'C++': { language: 'cpp', version: '10.2.0' },
};

export const ExecutionEngine = {
  async runCode(languageName, code) {
    const config = LANGUAGE_MAP[languageName];
    if (!config) {
      return { error: `Language ${languageName} is not supported by the execution engine.` };
    }

    try {
      // Use the AI code simulator since Piston API is restricted
      return await LLMService.simulateExecution(languageName, code);
    } catch (e) {
      console.error('Execution Engine Error:', e);
      return { error: 'Failed to reach execution server. Check your internet connection.' };
    }
  }
};
