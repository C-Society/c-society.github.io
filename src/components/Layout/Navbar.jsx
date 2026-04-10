import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleAnchorLink = (e, targetId) => {
        e.preventDefault();
        setIsMenuOpen(false);
        
        if (location.pathname === '/') {
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/');
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
            padding: '1rem 0', 
            position: 'fixed', 
            width: '100%', 
            top: 0, 
            zIndex: 1000, 
            background: 'rgba(10, 10, 15, 0.9)', 
            backdropFilter: 'blur(10px)', 
            borderBottom: '1px solid var(--glass-border)' 
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsMenuOpen(false)}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.05em' }}>
                        Code<span className="text-gradient">Society</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="nav-desktop" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
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
                        fontWeight: '500'
                    }}>About</a>
                    
                    <a href="#apply" onClick={(e) => handleAnchorLink(e, 'apply')} className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem' }}>
                        Questions?
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="mobile-menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{ background: 'none', border: 'none', color: 'white', display: 'none', cursor: 'pointer' }}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <div className="mobile-nav" style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    background: 'var(--bg-primary)', 
                    padding: '1.5rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.5rem', 
                    borderBottom: '1px solid var(--border-color)',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: location.pathname === '/' ? '600' : '400' }}>Home</Link>
                    <Link to="/ate" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-accent)' }}>AI Tutor 🪄</Link>
                    <Link to="/lessons" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: location.pathname === '/lessons' ? '600' : '400' }}>Lessons</Link>
                    <a href="#about" onClick={(e) => handleAnchorLink(e, 'about')} style={{ fontSize: '1.1rem' }}>About</a>
                    <a href="#apply" onClick={(e) => handleAnchorLink(e, 'apply')} className="btn btn-primary" style={{ textAlign: 'center' }}>Questions?</a>
                </div>
            )}

            <style>{`
                @media (max-width: 991px) {
                    .nav-desktop { display: none !important; }
                    .mobile-menu-toggle { display: block !important; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
