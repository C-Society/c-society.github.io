import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, PlayCircle, StopCircle, Loader, Sparkles, Mic, MicOff } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { LLMService } from '../../services/LLMService';
import { VoiceService } from '../../services/VoiceService';

export const ChatInterface = () => {
  const { chatHistory, addChatMessage, clearChat, currentLesson, codeContent } = useStore();
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [isPlayingId, setIsPlayingId] = useState(null);
  const [synthesizingId, setSynthesizingId] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInputVal(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      VoiceService.stop();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleMsgTTS = async (text, msgId) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    if (isPlayingId === msgId) {
      VoiceService.stop();
      setIsPlayingId(null);
      setSynthesizingId(null);
      return;
    }
    
    VoiceService.stop();
    setIsPlayingId(msgId);
    setSynthesizingId(msgId);

    const textToRead = text.replace(/[#*`_>\[\]]/g, '');
    
    VoiceService.playStream(
      textToRead,
      () => setSynthesizingId(null), // when first audio begins
      () => {
        setIsPlayingId(null); // when sequence finishes
        setSynthesizingId(null);
      }
    );
  };

  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const messageToSend = textOverride || inputVal.trim();
    if (!messageToSend) return;

    setInputVal('');
    addChatMessage({ role: 'user', content: messageToSend });

    setIsTyping(true);
    try {
      const response = await LLMService.chatWithAgent(
        [...chatHistory, { role: 'user', content: messageToSend }],
        currentLesson,
        codeContent
      );
      addChatMessage({ role: 'agent', content: response });
    } catch (e) {
      console.error("Chat error", e);
      addChatMessage({ role: 'agent', content: "I'm so sorry, I hit a snag in my neural net. Can you try asking that again?" });
    } finally {
      setIsTyping(false);
    }
  };

  const actionChips = [
    "What's a variable?",
    "Explain my error",
    "How do I start?",
    "Check my logic"
  ];

  return (
    <div className="panel glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.2)', 
            padding: '6px', 
            borderRadius: '50%',
            color: 'var(--accent-primary)'
          }}>
            <Bot size={18} />
          </div>
          <span className="title-glow">Any Questions?</span>
        </div>
        <button className="btn-secondary" onClick={clearChat} style={{ fontSize: '0.7rem', opacity: 0.5 }}>
          Clear
        </button>
      </div>

      <div className="panel-content chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1.2rem' }}>
        {chatHistory.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1rem' }}>
             <div style={{ 
                width: '50px', height: '50px', 
                background: 'rgba(99, 102, 241, 0.1)', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem',
                border: '1px solid var(--border-glow)'
              }}>
                <Sparkles size={24} color="var(--accent-primary)" />
              </div>
            <h3 style={{ fontSize: '1.2rem' }}>Hi there!</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Ask me anything about your coding journey!</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {actionChips.map((chip, i) => (
                <button key={i} className="action-chip" onClick={() => handleSend(null, chip)}>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
        
          <div key={index} className={`chat-bubble ${msg.role === 'user' ? 'chat-user' : 'chat-agent'}`} style={{
            boxShadow: msg.role === 'agent' ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none',
            border: msg.role === 'agent' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
            maxWidth: window.innerWidth < 600 ? '95%' : '85%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: msg.role === 'user' ? 'var(--text-secondary)' : 'var(--accent-primary)' }}>
                {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                <span>{msg.role === 'user' ? 'You' : 'Companion'}</span>
              </div>
              {msg.role === 'agent' && (
                <button 
                  onClick={() => toggleMsgTTS(msg.content, index)}
                  disabled={synthesizingId === index}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                >
                  {synthesizingId === index ? <Loader size={12} className="animate-spin" /> : (isPlayingId === index ? <StopCircle size={12} /> : <PlayCircle size={12} />)}
                </button>
              )}
            </div>
            <div className="markdown-body" style={{ fontSize: '0.92rem' }}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble chat-agent">
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
              <div style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
              <div style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '0 1rem 0.5rem' }}>
         <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {chatHistory.length > 0 && actionChips.slice(0, 3).map((chip, i) => (
              <button key={i} className="action-chip" style={{ whiteSpace: 'nowrap', fontSize: '0.7rem' }} onClick={() => handleSend(null, chip)}>
                {chip}
              </button>
            ))}
         </div>
      </div>

      <form onSubmit={(e) => handleSend(e)} className="chat-input-container" style={{ padding: '0 1rem 1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Ask a question..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isTyping}
            style={{ width: '100%', paddingRight: '4.5rem' }}
          />
          <div style={{ 
            position: 'absolute', 
            right: '8px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: '4px'
          }}>
            <button 
              type="button" 
              onClick={toggleListening}
              style={{ 
                background: isListening ? 'rgba(239, 68, 68, 0.15)' : 'transparent', 
                color: isListening ? '#ef4444' : 'var(--text-secondary)', 
                border: 'none', 
                padding: '4px',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isListening ? "Stop Listening" : "Start Voice Input"}
              className={isListening ? "pulse-red" : ""}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button type="submit" disabled={isTyping || !inputVal.trim()} style={{ 
              background: 'transparent', 
              color: 'var(--accent-primary)', 
              border: 'none', 
              padding: '4px',
              opacity: inputVal.trim() ? 1 : 0.3,
              cursor: inputVal.trim() ? 'pointer' : 'default'
            }}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
