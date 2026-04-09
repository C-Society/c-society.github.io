import React from 'react';
import { Link } from 'react-router-dom';

const Lessons = () => {
    const curricula = [
        {
            title: "Python 🐍",
            description: "The perfect start for general programming, data science, and AI.",
            targets: [
                {
                    group: "Kids & Teens",
                    steps: [
                        "Step 1: Introduction to Coding - Variables and Strings",
                        "Step 2: Drawing shapes with Python Turtle 🐢",
                        "Step 3: If statements and simple logic games",
                        "Step 4: Building a Text Adventure Game",
                        "Step 5: Introduction to Lists and Loops"
                    ]
                },
                {
                    group: "Adults",
                    steps: [
                        "Week 1: Foundations - Syntax, Variables, Data Types",
                        "Week 2: Advanced Logic - Conditionals and Collections",
                        "Week 3: Functions, Modules, and Error Handling",
                        "Week 4: File I/O and External Libraries (PIP)",
                        "Week 5: Final Project - Building a CLI Application"
                    ]
                }
            ]
        },
        {
            title: "C++ ⚙️",
            description: "High-performance coding for systems engineering and game development.",
            targets: [
                {
                    group: "Kids & Teens",
                    steps: [
                        "Step 1: Setup - Your first VS Code project",
                        "Step 2: Input and Output (cin/cout)",
                        "Step 3: Variables and simple math",
                        "Step 4: If/Else and for loops",
                        "Step 5: Building a simple Number Guessing Game"
                    ]
                },
                {
                    group: "Adults",
                    steps: [
                        "Week 1: The C++ Basics - Compilers and Entry Points",
                        "Week 2: Pointers and Memory Management Essentials",
                        "Week 3: Object Oriented Programming (OOP)",
                        "Week 4: Standard Template Library (STL)",
                        "Week 5: Multi-threading Basics or Game Engine Core"
                    ]
                }
            ]
        },
        {
            title: "Scratch 🧩",
            description: "Visual block-based coding to master fundamental logic.",
            targets: [
                {
                    group: "Kids (Only)",
                    steps: [
                        "Step 1: Sprite Control - Making things move!",
                        "Step 2: Events - When the Green Flag is clicked",
                        "Step 3: Loops and Sounds",
                        "Step 4: Creating your first Catch-the-Object game",
                        "Step 5: Variables - Tracking your high score"
                    ]
                }
            ]
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <nav style={{ padding: '1.5rem 0', background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--glass-border)', position: 'fixed', width: '100%', top: 0, zIndex: 50 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.05em' }}>
                        Code<span className="text-gradient">Society</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <Link to="/" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Back to Home</Link>
                    </div>
                </div>
            </nav>

            <main className="container" style={{ paddingTop: '120px', paddingBottom: '6rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in-up">
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem' }}>
                        Free Learning <span className="text-gradient">Curriculum</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '700px', margin: '0 auto' }}>
                        Start your journey with our structured paths designed for all experience levels.
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '3rem' }}>
                    {curricula.map((tech, i) => (
                        <div key={i} className="glass-panel animate-fade-in-up" style={{ padding: '3rem', position: 'relative', overflow: 'hidden', animationDelay: `${i * 100}ms` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{tech.title}</h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>{tech.description}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                                {tech.targets.map((target, j) => (
                                    <div key={j} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                        <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
                                            {target.group}
                                        </h3>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {target.steps.map((step, k) => (
                                                <li key={k} style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '0.925rem', display: 'flex', gap: '0.75rem' }}>
                                                    <span style={{ color: 'var(--text-secondary)', fontWeight: '700' }}>0{k + 1}</span>
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <footer style={{ padding: '4rem 0', background: '#050508', borderTop: '1px solid var(--glass-border)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.5rem', marginBottom: '1rem' }}>
                        Code<span className="text-gradient">Society</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        &copy; {new Date().getFullYear()} CodeSociety Global Initiative.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Lessons;
