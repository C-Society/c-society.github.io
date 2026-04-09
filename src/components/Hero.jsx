import { Link } from 'react-router-dom';
import TerminalWindow from './TerminalWindow';
import HorizontalMatrix from './Visuals/HorizontalMatrix';

const Hero = () => {
  const codeLines = [
    "cs create project --name code-society",
    "Installing dependencies... [OK]",
    "Initializing AI Tutor Agent... [CONNECTED]",
    "System check: Healthy",
    "Ready to empower new creators."
  ];

  const techStack = [
    { name: "Python", icon: "🐍", url: "https://www.python.org/" },
    { name: "JavaScript", icon: "JS", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    { name: "React", icon: "⚛️", url: "https://react.dev/" },
    { name: "Node.js", icon: "🟢", url: "https://nodejs.org/" },
    { name: "C++", icon: "++", url: "https://isocpp.org/" },
    { name: "Rust", icon: "🦀", url: "https://www.rust-lang.org/" }
  ];

  const scrollToForm = () => {
    const formElement = document.getElementById('apply');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <section className="section" style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      paddingTop: '4rem',
      overflow: 'hidden'
    }}>
      <HorizontalMatrix />

      <div className="bg-glow"></div>
      
      <div className="container" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '4rem', 
        alignItems: 'center' 
      }}>
        <div className="animate-fade-in-up">
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '0.5rem 1rem', 
            background: 'rgba(99, 102, 241, 0.1)', 
            borderRadius: '9999px', 
            border: '1px solid rgba(99, 102, 241, 0.2)', 
            marginBottom: '1.5rem', 
            color: 'var(--text-accent)', 
            fontWeight: '600', 
            fontFamily: 'var(--font-code)',
            fontSize: '0.75rem' 
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            SYSTEM: ONLINE | v2.4.0-stable
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', marginBottom: '1.5rem', lineHeight: '1.1' }}>
            Learn to <span className="title-glow" style={{ fontFamily: 'var(--font-code)' }}>Build()</span><br />
            with <span className="text-gradient">AI Guidance</span>
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', lineHeight: '1.8' }}>
            CodeSociety provides high-quality, AI-driven programming education for everyone. No barriers. Just clean code and expert mentorship.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link to="/ate" className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
               Launch AI Tutor 🪄
            </Link>
            <button className="btn btn-secondary" onClick={scrollToForm}>
              Ask a Question
            </button>
          </div>

          {/* Tech Marquee */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {techStack.map(tech => (
              <a 
                key={tech.name} 
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="tech-link"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.8rem', 
                  fontFamily: 'var(--font-code)',
                  textDecoration: 'none',
                  color: 'inherit',
                  opacity: 0.6,
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1rem' }}>{tech.icon}</span>
                {tech.name}
              </a>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }} className="animate-fade-in-up delay-200">
          <TerminalWindow codeLines={codeLines} title="codesociety --terminal" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
