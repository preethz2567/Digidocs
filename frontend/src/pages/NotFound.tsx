import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

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
          width: '60px',
          height: '60px',
          borderRadius: '6px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          margin: '0 auto 24px',
        }}>
          <FileQuestion size={28} strokeWidth={1.5} />
        </div>

        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>
          404 Error
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', marginBottom: '10px', letterSpacing: '-0.02em' }}>
          Page not found
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '28px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/dashboard')}
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
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              height: '34px',
              padding: '0 16px',
              background: '#ffffff',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
