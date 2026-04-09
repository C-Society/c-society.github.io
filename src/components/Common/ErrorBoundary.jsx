import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          border: '1px solid var(--danger)',
          background: 'rgba(239, 68, 68, 0.05)',
          margin: '1rem',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Something went wrong</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            We encountered an error rendering this component.
          </p>
          <button 
            className="btn-primary" 
            onClick={() => window.location.reload()}
            style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}
