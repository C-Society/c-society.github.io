import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';
import { Play, Code, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ExecutionEngine } from '../../services/ExecutionEngine';
import { LLMService } from '../../services/LLMService';

export const CodeEditor = () => {
  const { language, codeContent, setCodeContent, currentLesson, markLessonCompleted } = useStore();
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  // Map our UI languages to Monaco language identifiers
  const monacoLanguage = (language || 'python').toLowerCase() === 'c++' ? 'cpp' : (language || 'python').toLowerCase();

  const handleRunCode = async () => {
    setIsExecuting(true);
    setAssessmentResult(null);
    try {
      const result = await ExecutionEngine.runCode(language, codeContent);
      if (result.error && !result.output) {
        setOutput(`Error: ${result.error}${result.raw ? '\n' + JSON.stringify(result.raw) : ''}`);
      } else {
        setOutput(`${result.error ? '⚠️ ' + result.error + '\n' : ''}${result.output || ''}`);
      }
    } catch (e) {
      setOutput(`Failed to execute: ${e.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFixError = async () => {
    if (!output.includes('Error')) return;
    setIsFixing(true);
    try {
      const response = await LLMService.chatWithAgent(
        [{ role: 'user', content: `My code is giving this error: "${output}". Here is my code:\n\n${codeContent}\n\nPlease fix the code and return ONLY the corrected code block.` }],
        currentLesson,
        codeContent
      );
      // Extract code block if it has backticks
      const fixedCode = response.includes('```') ? response.split('```')[1].split('\n').slice(1).join('\n') : response;
      setCodeContent(fixedCode.trim());
      setOutput('Code fixed! Run it to verify.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsFixing(false);
    }
  };

  const handleExplainCode = async () => {
    setIsExplaining(true);
    try {
      const response = await LLMService.chatWithAgent(
        [{ role: 'user', content: `Please explain how this code works in simple terms:\n\n${codeContent}` }],
        currentLesson,
        codeContent
      );
      // We'll send this to the chat instead of showing it here to keep UI clean
      useStore.getState().addChatMessage({ role: 'agent', content: response });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  };

  const hasError = output.toLocaleLowerCase().includes('error') || output.toLocaleLowerCase().includes('exception');

  const handleAssess = async () => {
    if (!currentLesson) return;
    setIsAssessing(true);
    try {
      // First, get the latest execution output
      let execOutput = output;
      if (!output || output === 'Executing...') {
        const result = await ExecutionEngine.runCode(language, codeContent);
        execOutput = `${result.error ? result.error + '\n' : ''}${result.output || ''}`;
        setOutput(execOutput);
      }

      const result = await LLMService.assessCode(language, currentLesson.task, codeContent, execOutput);
      setAssessmentResult(result);
    } catch (e) {
      console.error(e);
      setAssessmentResult({ isPassed: false, feedback: "Error connecting to AI assessor." });
    } finally {
      setIsAssessing(false);
    }
  };

  return (
    <div className="panel glass-panel editor-container animate-fade-in">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={20} className="title-glow" />
          <span className="title-glow">Editor • {language}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {hasError && (
            <button 
              className="btn-secondary" 
              onClick={handleFixError} 
              disabled={isFixing}
              style={{ color: 'var(--text-accent)', borderColor: 'var(--text-accent)', background: 'rgba(100, 255, 218, 0.1)' }}
            >
              {isFixing ? 'Fixing...' : '🪄 Fix Error'}
            </button>
          )}
          <button className="btn-secondary" onClick={handleExplainCode} disabled={isExplaining}>
             {isExplaining ? 'Explaining...' : '💡 Explain'}
          </button>
          <button className="btn-secondary" onClick={handleRunCode} disabled={isExecuting} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <Play size={14} /> {isExecuting ? '...' : 'Run'}
          </button>
          <button className="btn-primary" onClick={handleAssess} disabled={isAssessing || !currentLesson} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <CheckCircle size={14} /> {isAssessing ? 'Assessing...' : 'Submit'}
          </button>
        </div>
      </div>
      
      <div className="monaco-wrapper">
        <Editor
          height="100%"
          language={monacoLanguage}
          theme="vs-dark"
          value={codeContent || ''}
          onChange={(v) => setCodeContent(v)}
          loading={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}><Loader className="animate-spin" /> Preparing Editor...</div>}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            automaticLayout: true,
          }}
        />
      </div>

      <div className="terminal-panel" style={{ background: '#050508', borderTop: '2px solid var(--bg-tertiary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Console Output</span>
          {output && <button onClick={() => setOutput('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.7rem' }}>Clear</button>}
        </div>
        <pre style={{ 
          margin: 0, 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-all', 
          color: hasError ? 'var(--danger)' : 'var(--text-primary)',
          opacity: output ? 1 : 0.3
        }}>
          {output || 'Run your code to see results here...'}
        </pre>
      </div>

      {(assessmentResult || isAssessing) && (
        <div style={{
          padding: '1.2rem',
          background: assessmentResult?.isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          borderTop: `1px solid ${assessmentResult?.isPassed ? 'var(--success)' : 'var(--danger)'}`,
          maxHeight: '200px',
          overflowY: 'auto',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {isAssessing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader size={18} className="animate-spin" />
              <span style={{ color: 'var(--text-secondary)' }}>AI is evaluating your code...</span>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                {assessmentResult.isPassed ? <CheckCircle color="var(--success)" size={20}/> : <XCircle color="var(--danger)" size={20}/>}
                <strong style={{ color: assessmentResult.isPassed ? 'var(--success)' : 'var(--danger)', fontSize: '1.1rem' }}>
                  {assessmentResult.isPassed ? 'Excellent Work!' : 'Not Quite There'}
                </strong>
              </div>
              <div className="markdown-body" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                <ReactMarkdown>{assessmentResult.feedback}</ReactMarkdown>
              </div>
              {assessmentResult.isPassed && (
                <button className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => markLessonCompleted(currentLesson.id)}>
                   Next Challenge
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
