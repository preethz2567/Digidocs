import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          fontFamily: 'inherit',
          padding: '24px',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '360px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '6px',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
              margin: '0 auto 20px',
            }}>
              <AlertTriangle size={24} strokeWidth={1.5} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={this.handleRetry}
              style={{
                height: '34px',
                padding: '0 16px',
                background: '#111827',
                color: '#ffffff',
                border: '1px solid #111827',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
