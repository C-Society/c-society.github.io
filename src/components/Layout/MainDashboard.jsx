import React, { useState, useEffect, useRef } from 'react';
import { LessonPanel } from '../Curriculum/LessonPanel';
import { CodeEditor } from '../Editor/CodeEditor';
import { ChatInterface } from '../Chat/ChatInterface';
import { LevelAssessment } from '../Modals/LevelAssessment';
import { OnboardingTutorial } from '../Onboarding/OnboardingTutorial';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { HelpCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { LLMService } from '../../services/LLMService';
import '../../ate-styles.css';

export const MainDashboard = () => {
  const navigate = useNavigate();
  const { 
    language, setLanguage, 
    hasCompletedOnboarding, setOnboardingComplete,
    isAdvancedMode, setAdvancedMode 
  } = useStore();

  const [showAssessment, setShowAssessment] = useState(!hasCompletedOnboarding);
  const [showTutorial, setShowTutorial] = useState(false);
  const [leftWidth, setLeftWidth] = useState(380);
  const [rightWidth, setRightWidth] = useState(350);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'online', 'error'
  const [apiError, setApiError] = useState(null);

  const dashboardRef = useRef(null);

  const handleLangChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleAssessmentComplete = () => {
    setShowAssessment(false);
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setOnboardingComplete(true);
  };

  const startResizingLeft = () => setIsResizingLeft(true);
  const startResizingRight = () => setIsResizingRight(true);
  const stopResizing = () => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  };

  const handleMouseMove = (e) => {
    if (!isResizingLeft && !isResizingRight) return;
    
    const containerRect = dashboardRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    if (isResizingLeft) {
      const newWidth = e.clientX - containerRect.left;
      if (newWidth > 300 && newWidth < 800) {
        setLeftWidth(newWidth);
      }
    } else if (isResizingRight) {
      const newWidth = containerRect.right - e.clientX;
      if (newWidth > 300 && newWidth < 600) {
        setRightWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizingLeft, isResizingRight]);

  useEffect(() => {
    const checkApi = async () => {
      setConnectionStatus('connecting');
      const result = await LLMService.checkConnection();
      if (result.ok) {
        setConnectionStatus('online');
        setApiError(null);
      } else {
        setConnectionStatus('error');
        setApiError(result.isKeyError ? 'API Key is invalid or restricted.' : result.error);
      }
    };
    
    checkApi();
    // Re-check every 5 minutes
    const interval = setInterval(checkApi, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="ate-container" 
      id="welcome-step" 
      ref={dashboardRef}
      style={{
        '--left-panel-width': `${leftWidth}px`,
        '--right-panel-width': `${rightWidth}px`,
        cursor: (isResizingLeft || isResizingRight) ? 'col-resize' : 'default',
        userSelect: (isResizingLeft || isResizingRight) ? 'none' : 'auto'
      }}
    >
      {/* Global Controls Overlay */}
      <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/')}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', background: 'rgba(99, 102, 241, 0.15)', borderColor: 'var(--accent-primary)' }}
        >
          <ChevronLeft size={16} /> Back to Hub
        </button>
        
        <div id="language-selector-gate">
          <select 
            value={language} 
            onChange={handleLangChange}
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.4rem 0.8rem',
              fontFamily: 'var(--font-main)',
              cursor: 'pointer'
            }}
          >
            <optgroup label="Systems & General">
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Rust">Rust</option>
              <option value="Go">Go</option>
            </optgroup>
            <optgroup label="Web & Mobile">
              <option value="HTML">HTML / CSS</option>
              <option value="PHP">PHP</option>
              <option value="Swift">Swift</option>
              <option value="Kotlin">Kotlin</option>
            </optgroup>
            <optgroup label="Data Science">
              <option value="SQL">SQL</option>
              <option value="R">R Language</option>
            </optgroup>
          </select>
        </div>
        
        <button 
          onClick={() => setShowTutorial(true)}
          className="btn-secondary"
          style={{ fontSize: '0.7rem', padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <HelpCircle size={14} /> Replay Tutorial
        </button>

        <button 
          onClick={() => setAdvancedMode(!isAdvancedMode)}
          className="btn-secondary"
          style={{ fontSize: '0.7rem', padding: '0.4rem 0.6rem' }}
        >
          {isAdvancedMode ? 'Advanced Mode: ON' : 'Basic Mode'}
        </button>

        {/* Real Connectivity Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.4rem 0.8rem',
          borderRadius: '6px',
          background: connectionStatus === 'online' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255, 78, 78, 0.1)',
          border: `1px solid ${connectionStatus === 'online' ? 'rgba(0, 255, 157, 0.2)' : 'rgba(255, 78, 78, 0.2)'}`,
          fontSize: '0.7rem',
          fontWeight: 'bold',
          color: connectionStatus === 'online' ? '#00ff9d' : '#ff4e4e'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: connectionStatus === 'online' ? '#00ff9d' : (connectionStatus === 'connecting' ? '#ffcc00' : '#ff4e4e'),
            boxShadow: connectionStatus === 'online' ? '0 0 10px #00ff9d' : 'none',
            animation: connectionStatus === 'connecting' ? 'pulse 1s infinite' : 'none'
          }} />
          {connectionStatus === 'online' ? 'A.I. ONLINE' : (connectionStatus === 'connecting' ? 'CONNECTING...' : 'KEY ERROR')}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="dashboard-layout">
        <div id="lesson-panel-gate" style={{ height: '100%' }}>
          <ErrorBoundary>
            <LessonPanel />
          </ErrorBoundary>
        </div>
        
        <div 
          className={`resize-handle ${isResizingLeft ? 'active' : ''}`} 
          onMouseDown={startResizingLeft}
        />

        <div id="code-editor-gate" style={{ height: '100%' }}>
          <ErrorBoundary>
            <CodeEditor />
          </ErrorBoundary>
        </div>
        
        <div 
          className={`resize-handle ${isResizingRight ? 'active' : ''}`} 
          onMouseDown={startResizingRight}
        />

        <div id="chat-interface-gate" style={{ height: '100%' }}>
          <ErrorBoundary>
            <ChatInterface />
          </ErrorBoundary>
        </div>
      </div>

      {/* Modals & Overlays */}
      {showAssessment && (
        <LevelAssessment onComplete={handleAssessmentComplete} />
      )}
      
      {showTutorial && (
        <OnboardingTutorial onComplete={handleTutorialComplete} />
      )}
    </div>
  );
};
