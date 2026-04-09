import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const ApplicationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        ageGroup: 'kid',
        country: '',
        reason: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const countries = [
        "United States", "India", "United Kingdom", "Canada", "Australia",
        "Germany", "France", "Japan", "Brazil", "Nigeria", "South Africa", "Other"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        // Check if the keys are just the placeholder values or missing
        // We'll still save to LocalStorage even if EmailJS fails or is unconfigured for the Admin Demo
        const saveToLocalStorage = () => {
            const existingApps = JSON.parse(localStorage.getItem('cs_applications') || '[]');
            const newApp = {
                ...formData,
                id: Date.now(),
                status: 'pending',
                date: new Date().toLocaleDateString()
            };
            localStorage.setItem('cs_applications', JSON.stringify([newApp, ...existingApps]));
        };

        try {
            // 1. Try sending email if configured
            if (serviceId && serviceId !== 'your_service_id_here' &&
                templateId && templateId !== 'your_template_id_here' &&
                publicKey && publicKey !== 'your_public_key_here') {

                const templateParams = {
                    name: formData.name,
                    email: formData.email,
                    ageGroup: formData.ageGroup,
                    country: formData.country,
                    reason: formData.reason
                };

                await emailjs.send(serviceId, templateId, templateParams, publicKey);
            } else {
                console.warn('EmailJS not configured. Saving to LocalStorage only.');
            }

            // 2. Always save to LocalStorage for the Admin Page
            saveToLocalStorage();

            setSubmitted(true);
            setFormData({ name: '', email: '', ageGroup: 'kid', country: '', reason: '' });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            console.error('Failed to send email:', err);
            // Even if email fails, let's save to LocalStorage so admin can see it
            saveToLocalStorage();
            setSubmitted(true); // Treat as success for the user demo, but maybe show a note if needed.
            setFormData({ name: '', email: '', ageGroup: 'kid', country: '', reason: '' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="apply" className="section" style={{ position: 'relative' }}>
            <div className="bg-glow-right"></div>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in-up">
                    <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', marginBottom: '1rem' }}>
                        Have Any <span className="text-gradient-alt">Questions?</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
                        We're here to help! Send us a message and we'll get back to you as soon as possible.
                    </p>
                </div>

                <div className="glass-panel animate-fade-in-up delay-200" style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 2rem' }}>
                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-secondary)', marginBottom: '1.5rem' }}>
                                <svg style={{ width: '40px', height: '40px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Message Received!</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Thank you for reaching out. We will review your question and get back to you via email soon.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {errorMsg && (
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
                                    {errorMsg}
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Full Name</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="John Doe" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">Email Address</label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" placeholder="john@example.com" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                <div className="form-group">
                                    <label htmlFor="ageGroup" className="form-label">Age Group</label>
                                    <select id="ageGroup" name="ageGroup" value={formData.ageGroup} onChange={handleChange} className="form-select">
                                        <option value="kid">Kid / Teen (Under 18)</option>
                                        <option value="adult">Adult (18+)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="country" className="form-label">Country</label>
                                    <select id="country" name="country" value={formData.country} onChange={handleChange} required className="form-select">
                                        <option value="" disabled>Select your country</option>
                                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="reason" className="form-label">How can we help you?</label>
                                <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} required className="form-textarea" style={{ minHeight: '150px' }} placeholder="Type your question here..."></textarea>
                            </div>

                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', maxWidth: '300px' }}>
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ApplicationForm;
