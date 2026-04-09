import React from 'react';

const AboutUs = () => {
    // Temporary placeholder data. The user can swap this out easily!
    const creators = [
        {
            name: "Krish Sathyan",
            role: "Founder & Chief Architect",
            bio: "// Rising 11th grader at Cerritos High School",
            stats: { projects: "12" },
            avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Krish&backgroundColor=b6e3f4"
        }
    ];

    const creator = creators[0];

    return (
        <section id="about" className="section" style={{ background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
            <div className="container">
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in-up">
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
                        AUTHORS.md
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-code)' }}>
                        Lead <span className="text-gradient">Architect</span>
                    </h2>
                    <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        The visionary engineer building the future of open-access programming education.
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="glass-panel animate-fade-in-up delay-100" style={{ 
                        padding: '2rem', 
                        maxWidth: '450px',
                        width: '100%',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                        cursor: 'default',
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--bg-tertiary)' }}>
                                <img src={creator.avatar} alt={creator.name} style={{ width: '100%', height: '100%', filter: 'grayscale(0.4)' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', fontFamily: 'var(--font-code)' }}>{creator.name}</h3>
                                <div style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontFamily: 'var(--font-code)', opacity: 0.8 }}>
                                    {creator.role}
                                </div>
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', fontFamily: 'var(--font-code)', fontStyle: 'italic' }}>
                            {creator.bio}
                        </p>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: `repeat(${Object.keys(creator.stats).length}, 1fr)`, 
                            gap: '8px', 
                            padding: '12px', 
                            background: 'rgba(0,0,0,0.2)', 
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.03)'
                        }}>
                            {Object.entries(creator.stats).map(([key, val]) => (
                                <div key={key} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '4px' }}>{key}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600', fontFamily: 'var(--font-code)' }}>{val}</div>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '4rem', opacity: 0.03, fontWeight: '900', fontFamily: 'var(--font-code)', pointerEvents: 'none' }}>
                            01
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
