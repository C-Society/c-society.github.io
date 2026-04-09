import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '../../store/useStore';
import { LLMService } from '../../services/LLMService';
import { VoiceService } from '../../services/VoiceService';
import { BookOpen, Sparkles, Trophy, PlayCircle, StopCircle, Loader } from 'lucide-react';

export const LessonPanel = () => {
  const { 
    currentLesson, setCurrentLesson, 
    language, skillLevel, completedLessons, weaknesses,
    markLessonCompleted
  } = useStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [hint, setHint] = useState(null);
  const [isGettingHint, setIsGettingHint] = useState(false);

  const PROGRESS_TOTAL = 10; // Assume 10 lessons per milestone

  const toggleTTS = async () => {
    if (isPlaying) {
      VoiceService.stop();
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsSynthesizing(false);
      return;
    }

    if (!currentLesson) return;

    setIsPlaying(true);
    setIsSynthesizing(true);

    const textToRead = `${currentLesson.title}. ${currentLesson.concept}. Explanation: ${currentLesson.explanation}. Your Task: ${currentLesson.task}`.replace(/[#*`_>\[\]]/g, '');
    
    VoiceService.playStream(
      textToRead,
      () => setIsSynthesizing(false),
      () => {
        setIsPlaying(false);
        setIsSynthesizing(false);
      }
    );
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      VoiceService.stop();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentLesson]);

  const handleGetHint = async () => {
    if (!currentLesson) return;
    setIsGettingHint(true);
    try {
      const response = await LLMService.chatWithAgent(
        [{ role: 'user', content: `Give me a small, helpful hint for the task: "${currentLesson.task}". Don't give me the full solution, just a nudge in the right direction.` }],
        currentLesson,
        ''
      );
      setHint(response);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGettingHint(false);
    }
  };

  const handleGenerateNext = async () => {
    setHint(null);
    setIsGenerating(true);
    try {
      const newLesson = await LLMService.generateLesson(language, skillLevel, completedLessons, weaknesses);
      setCurrentLesson(newLesson);
    } catch (error) {
      console.error("Failed to generate lesson", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const completeCurrent = () => {
    if (currentLesson?.id) {
      markLessonCompleted(currentLesson.id);
    }
  };

  const progressPercent = Math.min((completedLessons.length / PROGRESS_TOTAL) * 100, 100);

  return (
    <div className="panel glass-panel animate-fade-in">
      <div className="panel-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} className="title-glow" />
            <span className="title-glow">Your Curriculum</span>
          </div>
          <div className="progress-container" data-tooltip={`${completedLessons.length} lessons completed`}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
          {language} • {skillLevel}
        </div>
      </div>
      
      <div className="panel-content">
        {!currentLesson ? (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Sparkles size={48} style={{ color: 'var(--accent-primary)', opacity: 0.8, marginBottom: '1.5rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Start Your Journey</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              I'll create a personalized {language} lesson just for you.
            </p>
            <button 
              onClick={handleGenerateNext} 
              disabled={isGenerating}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
            >
              <Sparkles size={18} />
              {isGenerating ? 'Analyzing...' : 'Generate My First Lesson'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="title-glow" style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>
                  {currentLesson.title}
                </h2>
                <div 
                  className="action-chip" 
                  style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  data-tooltip="This is the main concept we're learning today."
                >
                  <Sparkles size={10} /> {currentLesson.concept}
                </div>
              </div>
              <button 
                onClick={toggleTTS} 
                className="btn-secondary"
                title="Listen to lesson"
                disabled={isSynthesizing}
                style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                {isSynthesizing ? <Loader size={16} className="animate-spin" /> : (isPlaying ? <StopCircle size={16} /> : <PlayCircle size={16} />)}
              </button>
            </div>

            <div className="markdown-body" style={{ fontSize: '0.95rem' }}>
              <ReactMarkdown>{currentLesson.explanation}</ReactMarkdown>
            </div>

            <div style={{ 
              background: 'rgba(99, 102, 241, 0.05)', 
              padding: '1.2rem', 
              borderRadius: '12px', 
              border: '1px solid var(--border-glow)',
              position: 'relative',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h3 style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>The Challenge</h3>
                <button 
                  className="btn-secondary" 
                  onClick={handleGetHint}
                  disabled={isGettingHint}
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: 'transparent' }}
                >
                  {isGettingHint ? 'Thinking...' : 'Get a Hint'}
                </button>
              </div>
              <div className="markdown-body">
                <ReactMarkdown>{currentLesson.task}</ReactMarkdown>
              </div>
              
              {hint && (
                <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(100, 255, 218, 0.1)', borderRadius: '8px', border: '1px border var(--text-accent)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-accent)', marginBottom: '0.3rem' }}>💡 Hint:</div>
                  <ReactMarkdown>{hint}</ReactMarkdown>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
              <button className="btn-secondary" onClick={completeCurrent} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <Trophy size={16} /> Skip
              </button>
              <button 
                className="btn-primary" 
                onClick={handleGenerateNext} 
                disabled={isGenerating} 
                style={{ flex: 1.5, fontSize: '0.9rem' }}
              >
                {isGenerating ? 'Personalizing...' : 'Next Lesson'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
