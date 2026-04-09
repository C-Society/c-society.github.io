import React from 'react';
import { Terminal, Globe, Cpu, Smartphone, Database } from 'lucide-react';

const Curriculum = () => {
    const paths = [
        {
            title: "Web Development",
            icon: <Globe size={24} />,
            color: "#6366f1",
            languages: ["JavaScript", "HTML / CSS", "PHP"],
            description: "Master the art of building modern, responsive websites and full-stack applications from scratch."
        },
        {
            title: "System Architecture",
            icon: <Cpu size={24} />,
            color: "#10b981",
            languages: ["C++", "Rust", "Go"],
            description: "Dive deep into high-performance systems engineering, memory management, and distributed networks."
        },
        {
            title: "Data & AI Intelligence",
            icon: <Database size={24} />,
            color: "#a855f7",
            languages: ["Python", "SQL", "R"],
            description: "Unlock the power of big data. Learn how to train AI models, query databases, and visualize insights."
        },
        {
            title: "Mobile Development",
            icon: <Smartphone size={24} />,
            color: "#ec4899",
            languages: ["Swift", "Kotlin", "Java"],
            description: "Build native, fluid applications for iOS and Android that scale to millions of users."
        }
    ];

    return (
        <section id="curriculum" className="section" style={{ position: 'relative' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in-up">
                    <div style={{ 
                        display: 'inline-block', 
                        padding: '0.4rem 0.8rem', 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        borderRadius: '4px', 
                        border: '1px solid rgba(99, 102, 241, 0.2)', 
                        marginBottom: '1.5rem', 
                        color: 'var(--accent-primary)', 
                        fontWeight: '600', 
                        fontFamily: 'var(--font-code)',
                        fontSize: '0.75rem' 
                    }}>
                        CURRICULUM.json
                    </div>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                        Choose Your <span className="text-gradient">Learning Path</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.8' }}>
                        Whether you want to build cross-platform apps, scale distributed systems, or master data science—we have a path tailored for you.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {paths.map((path, idx) => (
                        <div key={path.title} className={`glass-panel animate-fade-in-up delay-${(idx + 1) * 100}`} style={{ 
                            padding: '2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            transition: 'all 0.3s ease',
                            border: '1px solid rgba(255,255,255,0.03)'
                        }}>
                            <div style={{ 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '12px', 
                                background: `${path.color}15`, 
                                color: path.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px solid ${path.color}30`
                            }}>
                                {path.icon}
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>{path.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{path.description}</p>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
                                {path.languages.map(lang => (
                                    <span key={lang} style={{ 
                                        padding: '4px 10px', 
                                        background: 'rgba(255,255,255,0.05)', 
                                        borderRadius: '999px', 
                                        fontSize: '0.7rem', 
                                        fontFamily: 'var(--font-code)',
                                        color: 'rgba(255,255,255,0.6)',
                                        letterSpacing: '0.02em',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Curriculum;
