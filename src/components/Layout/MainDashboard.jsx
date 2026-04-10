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

  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson', 'editor', 'chat'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const startResizingLeft = () => { if (!isMobile) setIsResizingLeft(true); };
  const startResizingRight = () => { if (!isMobile) setIsResizingRight(true); };
  const stopResizing = () => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  };

  const handleMouseMove = (e) => {
    if (isMobile || (!isResizingLeft && !isResizingRight)) return;
    
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
    const interval = setInterval(checkApi, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`ate-container ${isMobile ? 'mobile-mode' : ''}`} 
      id="welcome-step" 
      ref={dashboardRef}
      style={{
        '--left-panel-width': isMobile ? '100%' : `${leftWidth}px`,
        '--right-panel-width': isMobile ? '100%' : `${rightWidth}px`,
        cursor: (isResizingLeft || isResizingRight) ? 'col-resize' : 'default',
        userSelect: (isResizingLeft || isResizingRight) ? 'none' : 'auto'
      }}
    >
      {/* Top Header Section */}
      <header className="ate-header">
        <div className="header-left">
          <button onClick={() => navigate('/')} className="back-btn">
            <ChevronLeft size={18} /> <span>Exit</span>
          </button>
          <div className="status-badge" data-status={connectionStatus}>
            <div className="dot" />
            <span className="desktop-text">{connectionStatus === 'online' ? 'A.I. ONLINE' : (connectionStatus === 'connecting' ? 'CONNECTING...' : 'ERROR')}</span>
          </div>
        </div>

        <div className="header-center">
          <select value={language} onChange={handleLangChange} className="lang-select">
            <optgroup label="Systems & General">
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Rust">Rust</option>
            </optgroup>
            <optgroup label="Web & Mobile">
              <option value="HTML">HTML / CSS</option>
              <option value="Swift">Swift</option>
              <option value="Kotlin">Kotlin</option>
            </optgroup>
          </select>
        </div>

        <div className="header-right">
          <button onClick={() => setShowTutorial(true)} className="icon-btn" title="Replay Tutorial">
            <HelpCircle size={20} />
          </button>
          <button 
            onClick={() => setAdvancedMode(!isAdvancedMode)} 
            className={`mode-btn ${isAdvancedMode ? 'active' : ''}`}
          >
            {isAdvancedMode ? (isMobile ? 'ADV' : 'Advanced') : (isMobile ? 'BSC' : 'Basic')}
          </button>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      {isMobile && (
        <nav className="mobile-tabs">
          <button 
            className={activeTab === 'lesson' ? 'active' : ''} 
            onClick={() => setActiveTab('lesson')}
          >
            Lesson
          </button>
          <button 
            className={activeTab === 'editor' ? 'active' : ''} 
            onClick={() => setActiveTab('editor')}
          >
            Code
          </button>
          <button 
            className={activeTab === 'chat' ? 'active' : ''} 
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
        </nav>
      )}

      {/* Main Layout Grid */}
      <div className="dashboard-layout">
        {(!isMobile || activeTab === 'lesson') && (
          <div id="lesson-panel-gate" className="panel-wrapper">
            <ErrorBoundary>
              <LessonPanel />
            </ErrorBoundary>
          </div>
        )}
        
        {!isMobile && (
          <div 
            className={`resize-handle ${isResizingLeft ? 'active' : ''}`} 
            onMouseDown={startResizingLeft}
          />
        )}

        {(!isMobile || activeTab === 'editor') && (
          <div id="code-editor-gate" className="panel-wrapper">
            <ErrorBoundary>
              <CodeEditor />
            </ErrorBoundary>
          </div>
        )}
        
        {!isMobile && (
          <div 
            className={`resize-handle ${isResizingRight ? 'active' : ''}`} 
            onMouseDown={startResizingRight}
          />
        )}

        {(!isMobile || activeTab === 'chat') && (
          <div id="chat-interface-gate" className="panel-wrapper">
            <ErrorBoundary>
              <ChatInterface />
            </ErrorBoundary>
          </div>
        )}
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
