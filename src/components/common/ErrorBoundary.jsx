import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Artisan Studio ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          background: '#FDFBF7',
          textAlign: 'center',
          fontFamily: "'Montserrat', sans-serif"
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#1C0F06', marginBottom: 8 }}>
            Artisan Studio Notice
          </h2>
          <p style={{ color: '#7A685A', maxWidth: 460, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            {this.state.error?.message || 'Something went wrong while loading this studio section.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              background: '#C8440A',
              color: '#FFF',
              border: 'none',
              padding: '10px 22px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🔄 Reload Studio Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
