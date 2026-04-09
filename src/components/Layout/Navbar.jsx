import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleAnchorLink = (e, targetId) => {
        e.preventDefault();
        
        if (location.pathname === '/') {
            // Already on home, just scroll
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Navigate home first, then scroll
            navigate('/');
            // Small timeout to allow Home component to render before scrolling
            setTimeout(() => {
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    return (
        <nav style={{ 
            padding: '1.5rem 0', 
            position: 'fixed', 
            width: '100%', 
            top: 0, 
            zIndex: 1000, 
            background: 'rgba(10, 10, 15, 0.8)', 
            backdropFilter: 'blur(10px)', 
            borderBottom: '1px solid var(--glass-border)' 
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.05em' }}>
                        Code<span className="text-gradient">Society</span>
                    </div>
                </Link>
                
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/" style={{ color: location.pathname === '/' ? 'white' : 'var(--text-secondary)', fontWeight: location.pathname === '/' ? '600' : '500' }}>Home</Link>
                    
                    <Link to="/ate" style={{ 
                        color: location.pathname === '/ate' ? 'var(--text-accent)' : 'var(--text-secondary)', 
                        fontWeight: '700', 
                        textShadow: location.pathname === '/ate' ? '0 0 10px rgba(100, 255, 218, 0.3)' : 'none' 
                    }}>AI Tutor 🪄</Link>
                    
                    <Link to="/lessons" style={{ 
                        color: location.pathname === '/lessons' ? 'white' : 'var(--text-secondary)', 
                        fontWeight: location.pathname === '/lessons' ? '600' : '500' 
                    }}>Lessons</Link>
                    
                    <a href="#about" onClick={(e) => handleAnchorLink(e, 'about')} style={{ 
                        color: 'var(--text-secondary)', 
                        fontWeight: '500', 
                        transition: 'color 0.2s', 
                        cursor: 'pointer' 
                    }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                        About
                    </a>
                    
                    <a href="#apply" onClick={(e) => handleAnchorLink(e, 'apply')} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}>
                        Questions?
                    </a>
                    
                    <Link to="/admin" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', opacity: 0.5 }}>
                        Admin
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
