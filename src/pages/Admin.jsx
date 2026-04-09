import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const Admin = () => {
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [selectedApp, setSelectedApp] = useState(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailContent, setEmailContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const navigate = useNavigate();

    const lessonPlans = {
        python: `PYTHON LESSON PLAN:\n1. Intro to variables\n2. Control flow\n3. Functions\n4. Data structures\n5. Final project`,
        cpp: `C++ LESSON PLAN:\n1. Syntax and I/O\n2. Pointers and memory\n3. Classes and OOP\n4. STL templates\n5. Systems project`,
        scratch: `SCRATCH LESSON PLAN (KIDS ONLY):\n1. Sprites and motion\n2. Event handling\n3. Loops and logic blocks\n4. Simple game mechanics\n5. Creative project`
    };

    useEffect(() => {
        const isAuth = sessionStorage.getItem('cs_admin_auth');
        if (isAuth !== 'true') {
            navigate('/login');
            return;
        }
        loadApplications();
    }, []);

    const loadApplications = () => {
        let apps = JSON.parse(localStorage.getItem('cs_applications') || '[]');

        // Seed an example if empty
        if (apps.length === 0) {
            apps = [{
                id: 1,
                name: "Example Student",
                email: "student@example.com",
                country: "Brazil",
                ageGroup: "kid",
                reason: "I want to learn how to build games!",
                status: "pending",
                date: new Date().toLocaleDateString()
            }];
            localStorage.setItem('cs_applications', JSON.stringify(apps));
        }

        setApplications(apps);

        const total = apps.length;
        const pending = apps.filter(a => a.status === 'pending').length;
        const approved = apps.filter(a => a.status === 'approved').length;
        setStats({ total, pending, approved });
    };

    const handleStatusUpdate = (id, newStatus) => {
        const updatedApps = applications.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        );
        localStorage.setItem('cs_applications', JSON.stringify(updatedApps));
        loadApplications();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            const updatedApps = applications.filter(app => app.id !== id);
            localStorage.setItem('cs_applications', JSON.stringify(updatedApps));
            loadApplications();
        }
    };

    const openEmailModal = (app) => {
        setSelectedApp(app);
        // Default to Python plan for example
        setEmailContent(`Hi ${app.name},\n\nWe are excited to approve your application for CodeSociety!\n\nHere is your custom lesson plan:\n\n${lessonPlans.python}\n\nBest,\nCodeSociety Team`);
        setIsEmailModalOpen(true);
    };

    const handleSendEmail = async () => {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_RESPONSE_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || serviceId === 'your_service_id_here') {
            alert('EmailJS is not configured.');
            return;
        }

        setIsSending(true);
        try {
            const params = {
                to_name: selectedApp.name,
                to_email: selectedApp.email,
                message: emailContent
            };

            console.log('Sending EmailJS with params:', params);

            await emailjs.send(serviceId, templateId, params, publicKey);

            alert('Email sent successfully!');
            handleStatusUpdate(selectedApp.id, 'approved');
            setIsEmailModalOpen(false);
        } catch (error) {
            console.error('Email error:', error);
            alert(`Failed to send email: ${error?.text || error?.message || 'Unknown error'}. Check your template variables.`);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <nav style={{ padding: '1rem 0', background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--glass-border)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.25rem' }}>
                        Code<span className="text-gradient">Society</span> <span style={{ fontSize: '0.875rem', fontWeight: '400', opacity: 0.6, marginLeft: '0.5rem' }}>Admin Portal</span>
                    </div>
                    <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Back to Site</Link>
                </div>
            </nav>

            <main className="container" style={{ padding: '3rem 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Applications</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.total}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Pending</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>{stats.pending}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Approved</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{stats.approved}</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Recent Applications</h2>
                    {applications.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No applications received yet.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem' }}>Name</th>
                                    <th style={{ padding: '1rem' }}>Email</th>
                                    <th style={{ padding: '1rem' }}>Country</th>
                                    <th style={{ padding: '1rem' }}>Age</th>
                                    <th style={{ padding: '1rem' }}>Reason</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => (
                                    <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.925rem' }}>
                                        <td style={{ padding: '1.25rem 1rem' }}>{app.name}</td>
                                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>{app.email}</td>
                                        <td style={{ padding: '1.25rem 1rem' }}>{app.country}</td>
                                        <td style={{ padding: '1.25rem 1rem', textTransform: 'capitalize' }}>{app.ageGroup}</td>
                                        <td style={{ padding: '1.25rem 1rem', maxWidth: '300px' }}>
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.reason}>
                                                {app.reason}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: app.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : app.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                                                color: app.status === 'approved' ? '#10b981' : app.status === 'rejected' ? '#ef4444' : 'var(--accent-secondary)'
                                            }}>
                                                {app.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {app.status === 'pending' && (
                                                    <button
                                                        onClick={() => openEmailModal(app)}
                                                        style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'var(--accent-primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                                                    >
                                                        Respond
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(app.id)} style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }} title="Delete">
                                                    🗑
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Email Modal */}
            {isEmailModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Send Approval & Lesson Plan</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', opacity: 0.6 }}>Recipient: {selectedApp?.email}</label>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }} onClick={() => setEmailContent(prev => prev.split('Here is your custom lesson plan:')[0] + 'Here is your custom lesson plan:\n\n' + lessonPlans.python + (prev.split('Best,')[1] ? '\n\nBest,' + prev.split('Best,')[1] : '\n\nBest,\nCodeSociety Team'))}>Python</button>
                            <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }} onClick={() => setEmailContent(prev => prev.split('Here is your custom lesson plan:')[0] + 'Here is your custom lesson plan:\n\n' + lessonPlans.cpp + (prev.split('Best,')[1] ? '\n\nBest,' + prev.split('Best,')[1] : '\n\nBest,\nCodeSociety Team'))}>C++</button>
                            <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }} onClick={() => setEmailContent(prev => prev.split('Here is your custom lesson plan:')[0] + 'Here is your custom lesson plan:\n\n' + lessonPlans.scratch + (prev.split('Best,')[1] ? '\n\nBest,' + prev.split('Best,')[1] : '\n\nBest,\nCodeSociety Team'))}>Scratch</button>
                        </div>

                        <textarea
                            className="form-textarea"
                            style={{ height: '300px', marginBottom: '2rem' }}
                            value={emailContent}
                            onChange={(e) => setEmailContent(e.target.value)}
                        />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={handleSendEmail}
                                disabled={isSending}
                            >
                                {isSending ? 'Sending...' : 'Send Lesson Plan'}
                            </button>
                            <button
                                className="btn"
                                style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}
                                onClick={() => setIsEmailModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
