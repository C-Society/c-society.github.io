import React from 'react';
import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import Curriculum from '../components/Curriculum';
import ApplicationForm from '../components/ApplicationForm';

const Home = () => {
    return (
        <>
            <main style={{ paddingTop: '80px' }}>
                <Hero />
                <AboutUs />
                <Curriculum />
                <ApplicationForm />
            </main>

            <footer style={{ padding: '4rem 0', background: '#050508', borderTop: '1px solid var(--glass-border)' }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.5rem', marginBottom: '1rem' }}>
                        Code<span className="text-gradient">Society</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
                        Empowering the next generation of builders, thinkers, and creators through code.
                    </p>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Home;
