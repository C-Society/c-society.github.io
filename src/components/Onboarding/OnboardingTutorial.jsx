import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { HelpCircle, ChevronRight, CheckCircle, Sparkles, X } from 'lucide-react';

const onboardingSteps = [
  {
    targetId: 'welcome-step',
    title: "Welcome to CodeSociety!",
    content: "I'm your personal AI tutor. Let's take a quick 1-minute tour to get you started.",
    placement: 'center'
  },
  {
    targetId: 'lesson-panel-gate',
    title: "Step 1: Your Curriculum",
    content: "This is where your dynamic lessons appear. I'll generate custom content for you based on your progress.",
    placement: 'right'
  },
  {
    targetId: 'code-editor-gate',
    title: "Step 2: Coding Area",
    content: "Write your code here. Use the 'Run' button to see results, and 'Assess' when you're ready to submit.",
    placement: 'bottom'
  },
  {
    targetId: 'chat-interface-gate',
    title: "Step 3: Any Questions?",
    content: "Stuck? Just ask me anything! I am here 24/7 to explain concepts, fix errors, or just chat about code.",
    placement: 'left'
  },
  {
    targetId: 'language-selector-gate',
    title: "Global Settings",
    content: "Switch between Python, JavaScript, and more anytime. Your progress is saved for each language.",
    placement: 'bottom-left'
  }
];

export const OnboardingTutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState(null);
  const [cardPosition, setCardPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  useEffect(() => {
    const step = onboardingSteps[currentStep];
    if (step.placement === 'center') {
      setHighlightRect(null);
      setCardPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      return;
    }

    const element = document.getElementById(step.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      const highlight = {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
      };
      setHighlightRect(highlight);

      // Card positioning logic
      const cardWidth = 350;
      const cardHeight = 250; // estimate
      let top = highlight.top;
      let left = highlight.left;

      switch(step.placement) {
        case 'right':
          left = highlight.left + highlight.width + 20;
          top = highlight.top + highlight.height / 2 - 100;
          break;
        case 'left':
          left = highlight.left - cardWidth - 20;
          top = highlight.top + highlight.height / 2 - 100;
          break;
        case 'bottom':
          top = highlight.top + highlight.height + 20;
          left = highlight.left + highlight.width / 2 - cardWidth / 2;
          break;
        case 'bottom-left':
          top = highlight.top + highlight.height + 20;
          left = highlight.left - cardWidth + 40;
          break;
        default:
          top = highlight.top;
          left = highlight.left;
      }

      // Viewport guards
      const margin = 20;
      if (isNaN(left) || left < margin) left = margin;
      if (isNaN(top) || top < margin) top = margin;
      
      const vw = window.innerWidth || 1024;
      const vh = window.innerHeight || 768;

      if (left + cardWidth > vw - margin) left = vw - cardWidth - margin;
      if (top + cardHeight > vh - margin) top = vh - cardHeight - margin;

      setCardPosition({ 
        top: `${Math.round(top)}px`, 
        left: `${Math.round(left)}px`, 
        transform: 'none' 
      });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="onboarding-overlay" style={{ zIndex: 2000 }}>
      {highlightRect && (
        <div 
          className="highlight-ring" 
          style={{ 
            top: highlightRect.top, 
            left: highlightRect.left, 
            width: highlightRect.width, 
            height: highlightRect.height,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }} 
        />
      )}
      
      <div 
        className="glass-panel onboarding-card animate-fade-in" 
        style={{ 
          maxWidth: '350px',
          padding: '1.5rem',
          position: 'absolute',
          ...cardPosition,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <button 
          onClick={handleSkip} 
          style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
          <Sparkles size={20} />
          <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tutorial • {currentStep + 1}/{onboardingSteps.length}</span>
        </div>

        <h3 className="title-glow" style={{ marginBottom: '0.8rem', fontSize: '1.2rem' }}>{step.title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          {step.content}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={handleSkip} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Skip Tutorial
          </button>
          <button 
            className="btn-primary" 
            onClick={handleNext}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 1rem', fontSize: '0.9rem' }}
          >
            {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
