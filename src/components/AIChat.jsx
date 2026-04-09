import React, { useState, useRef, useEffect, useCallback } from 'react';

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

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the CodeSociety AI. Ask me anything about our Python, C++, or Scratch curricula!" }
  ]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Model hierarchy to try if one fails. 
  // We prioritize 1.5 Flash as it is the most widely available free model.
  const MODELS = [
    'gemini-1.5-flash', 
    'gemini-1.5-flash-latest', 
    'gemini-2.0-flash', 
    'gemini-1.5-pro',
    'gemini-1.0-pro'
  ];
  const API_VERSIONS = ['v1', 'v1beta'];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Diagnostic: List models to console once to see what this key can actually do
      const apiKey = getApiKey()?.trim();
      if (apiKey && apiKey !== 'your_gemini_api_key_here') {
        const baseUrl = import.meta.env.DEV ? '/gemini-api' : 'https://generativelanguage.googleapis.com';
        fetch(`${baseUrl}/v1/models?key=${apiKey}`)
          .then(res => res.json())
          .then(data => console.log("[AI Chat DIAGNOSTIC] Available Models:", data))
          .catch(err => console.error("[AI Chat DIAGNOSTIC] Failed to list models:", err));
      }
    }
  }, [messages, status, isOpen, scrollToBottom]);

  /**
   * Recursive function to try different models and API versions
   */
  const callGeminiAPI = async (text, modelIndex = 0, versionIndex = 0) => {
    const apiKey = getApiKey()?.trim();
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error("Missing API Key. Please add VITE_GEMINI_API_KEY to your .env file and RESTART the server.");
    }
    
    const model = MODELS[modelIndex];
    const version = API_VERSIONS[versionIndex];

    console.log(`[AI Chat DEBUG] Trying ${version}/${model}...`);

    try {
      const baseUrl = import.meta.env.DEV ? '/gemini-api' : 'https://generativelanguage.googleapis.com';
      const response = await fetch(`${baseUrl}/${version}/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are a helpful AI assistant for CodeSociety. Give a concise, professional answer: ${text}` }] }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn(`[AI Chat DEBUG] Attempt failed: ${version}/${model}`, data.error);

        // 403 Forbidden usually means API not enabled or region restricted
        if (response.status === 403) {
          throw new Error(`Access Denied: ${data.error?.message || "Check if 'Generative Language API' is enabled."}`);
        }

        // 429 Quota Exceeded or 404/400 Not Available
        // We TRY THE NEXT MODEL even on 429 because some models have 0 quota while others are free
        if (response.status === 429 || response.status === 404 || response.status === 400) {
          // Try next version for the same model
          if (versionIndex < API_VERSIONS.length - 1) {
            return await callGeminiAPI(text, modelIndex, versionIndex + 1);
          }
          // If all versions failed for this model, try next model
          if (modelIndex < MODELS.length - 1) {
            return await callGeminiAPI(text, modelIndex + 1, 0);
          }
        }

        throw new Error(data.error?.message || `API Error ${response.status}`);
      }

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("No response generated (safety filters might have blocked it).");
      }

      console.log(`[AI Chat DEBUG] SUCCESS with ${version}/${model}`);
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      // If we've exhausted all options, throw the final error
      if (modelIndex >= MODELS.length - 1 && versionIndex >= API_VERSIONS.length - 1) {
        throw err;
      }
      
      // Keep falling back if it's a Quota or Not Found error
      const isFallbackError = err.message.toLowerCase().includes('quota') || 
                              err.message.includes('not found') || 
                              err.message.includes('supported');

      if (isFallbackError) {
        if (versionIndex < API_VERSIONS.length - 1) {
          return await callGeminiAPI(text, modelIndex, versionIndex + 1);
        }
        if (modelIndex < MODELS.length - 1) {
          return await callGeminiAPI(text, modelIndex + 1, 0);
        }
      }
      throw err;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const userText = input.trim();
    if (!userText || status === 'loading') return;

    // UI Updates
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setStatus('loading');
    setErrorMessage('');

    const apiKey = getApiKey()?.trim();

    // Simulation fallback if key is obviously missing
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      simulateAIResponse();
      return;
    }

    try {
      const aiResponse = await callGeminiAPI(userText);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setStatus('idle');
    } catch (err) {
      console.error('AI Integration Error:', err);
      setStatus('error');
      setErrorMessage(err.message);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: (
          <div style={{ color: '#ef4444' }}>
            <strong>Connection Failed:</strong><br/>
            {err.message}<br/>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
              Common fixes: Enable API in Google Cloud, check for spaces in .env, or restart dev server.
            </p>
          </div>
        )
      }]);
    }
  };

  const simulateAIResponse = () => {
    setTimeout(() => {
      setStatus('idle');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm in Simulator Mode! Once you add a valid Gemini API Key to your .env and restart the server, I'll be able to answer all your real coding questions. I look pretty good though, right?" 
      }]);
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary"
        style={{ 
          width: '64px', height: '64px', borderRadius: '50%', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
          boxShadow: '0 10px 40px rgba(168, 85, 247, 0.4)', transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="glass-panel" style={{ 
          position: 'absolute', bottom: '85px', right: 0, width: 'min(400px, 92vw)', height: '520px',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeInUp 0.3s ease-out',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 1001, border: '1px solid var(--glass-border)'
        }}>
          {/* Header */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(168, 85, 247, 0.1)', backdropFilter: 'blur(20px)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>CodeSociety <span className="text-gradient">Assistant</span></h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status === 'error' ? '#ef4444' : '#10b981' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {status === 'loading' ? 'AI is thinking...' : status === 'error' ? 'Connection Problem' : 'Online & Helpful'}
              </span>
            </div>
          </div>

          {/* Messages List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', padding: '0.8rem 1.1rem', fontSize: '0.925rem', lineHeight: '1.5',
                borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                {msg.content}
              </div>
            ))}
            {status === 'loading' && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '0.8rem 1rem', borderRadius: '18px 18px 18px 2px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="dot-typing"></span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '1rem' }}>Processing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ padding: '1.25rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.15)', display: 'flex', gap: '0.75rem' }}>
            <input 
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={status === 'loading' ? 'Thinking...' : 'Type a question...'}
              className="form-input" style={{ flex: 1, borderRadius: '25px', padding: '0.7rem 1.25rem', backdropFilter: 'blur(5px)' }}
              disabled={status === 'loading'}
            />
            <button 
              type="submit" className="btn-primary" 
              style={{ width: '45px', height: '45px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !input.trim() || status === 'loading' ? 0.5 : 1 }}
              disabled={!input.trim() || status === 'loading'}
            >
              ➜
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChat;
