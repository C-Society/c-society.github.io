import React, { useState, useEffect } from 'react';

const TerminalWindow = ({ codeLines, title = "zsh" }) => {
  const [visibleLines, setVisibleLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= codeLines.length) return;

    const currentFullLine = codeLines[currentLineIndex];
    
    if (currentCharIndex < currentFullLine.length) {
      const timer = setTimeout(() => {
        const newLines = [...visibleLines];
        if (currentCharIndex === 0) {
          newLines.push(currentFullLine[0]);
        } else {
          newLines[newLines.length - 1] = currentFullLine.substring(0, currentCharIndex + 1);
        }
        setVisibleLines(newLines);
        setCurrentCharIndex(prev => prev + 1);
      }, 30 + Math.random() * 40); // Random typing speed
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 500); // Pause between lines
      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, currentCharIndex, codeLines]);

  return (
    <div className="glass-panel animate-fade-in-up" style={{ 
      width: '100%', 
      maxWidth: '500px', 
      overflow: 'hidden', 
      fontFamily: 'var(--font-code)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        padding: '8px 16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
          {title}
        </div>
      </div>

      {/* Body */}
      <div style={{ 
        padding: '20px', 
        fontSize: '0.9rem', 
        color: '#d1d5db', 
        lineHeight: '1.6',
        minHeight: '260px',
        background: 'rgba(10, 10, 15, 0.4)'
      }}>
        {visibleLines.map((line, i) => (
          <div key={i} style={{ marginBottom: '4px' }}>
            <span style={{ color: 'var(--accent-primary)', marginRight: '10px' }}>$</span>
            {line}
          </div>
        ))}
        {currentLineIndex < codeLines.length && (
          <div style={{ display: 'inline-block', width: '8px', height: '16px', background: 'var(--accent-primary)', verticalAlign: 'middle', marginLeft: '4px', animation: 'pulse 1s infinite' }}></div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default TerminalWindow;
