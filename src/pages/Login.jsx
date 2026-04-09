import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

        if (!adminPassword || adminPassword === 'your_secure_password_here') {
            setError('Admin password is not configured in .env file.');
            return;
        }

        if (password === adminPassword) {
            sessionStorage.setItem('cs_admin_auth', 'true');
            navigate('/admin');
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
            <div className="bg-glow"></div>
            <div className="container" style={{ maxWidth: '450px' }}>
                <div className="glass-panel animate-fade-in-up" style={{ padding: '3rem 2.5rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '2rem', marginBottom: '1rem' }}>
                        Admin <span className="text-gradient">Login</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Enter your password to access the CodeSociety dashboard.
                    </p>

                    <form onSubmit={handleLogin}>
                        {error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            Sign In
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                            ← Back to Site
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
