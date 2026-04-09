import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Sparkles, CheckCircle2, ChevronRight, BrainCircuit } from 'lucide-react';

const assessmentQuestions = [
  {
    id: 1,
    question: "How much experience do you have with programming?",
    options: [
      { label: "None, I'm just starting out!", level: "beginner" },
      { label: "I know some basics (loops, variables).", level: "beginner" },
      { label: "I've built small projects before.", level: "intermediate" },
      { label: "I'm a seasoned developer.", level: "advanced" }
    ]
  },
  {
    id: 2,
    question: "Which of these concepts are you most comfortable with?",
    options: [
      { label: "What is a 'variable'?", level: "beginner" },
      { label: "Writing functions and logic.", level: "intermediate" },
      { label: "Optimizing algorithms & data structures.", level: "advanced" },
      { label: "System architecture & design patterns.", level: "advanced" }
    ]
  }
];

export const LevelAssessment = ({ onComplete }) => {
  const { updateProfile } = useStore();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState([]);

  const handleSelect = (level) => {
    const newSelections = [...selections, level];
    setSelections(newSelections);

    if (step < assessmentQuestions.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate final level
      const counts = newSelections.reduce((acc, l) => ({ ...acc, [l]: (acc[l] || 0) + 1 }), {});
      let finalLevel = "beginner";
      if (counts.advanced >= 1) finalLevel = "advanced";
      else if (counts.intermediate >= 1) finalLevel = "intermediate";
      
      updateProfile({ skillLevel: finalLevel });
      onComplete();
    }
  };

  const currentQ = assessmentQuestions[step];

  return (
    <div className="onboarding-overlay">
      <div className="glass-panel onboarding-card animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.2)', 
            padding: '1rem', 
            borderRadius: '50%',
            color: 'var(--accent-primary)'
          }}>
            <BrainCircuit size={40} />
          </div>
        </div>
        
        <h2 className="title-glow" style={{ marginBottom: '0.5rem' }}>Personalize Your Path</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Help me tailor the experience to your current knowledge.
        </p>

        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>
            {currentQ.question}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {currentQ.options.map((opt, i) => (
              <button 
                key={i}
                className="btn-secondary"
                onClick={() => handleSelect(opt.level)}
                style={{ 
                  textAlign: 'left', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem'
                }}
              >
                {opt.label}
                <ChevronRight size={16} opacity={0.5} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          {assessmentQuestions.map((_, i) => (
            <div 
              key={i} 
              style={{ 
                width: i === step ? '24px' : '8px', 
                height: '8px', 
                borderRadius: '4px', 
                background: i === step ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                transition: 'all 0.3s ease'
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
