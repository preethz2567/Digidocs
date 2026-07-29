import React from 'react';
import { Link } from 'react-router-dom';

import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';

const VerifyEmail: React.FC = () => {
  return (
    <PageContainer>
      <Card style={{ alignItems: 'center', textAlign: 'center' }}>
        {/* Success icon */}
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'var(--success-color)',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-6)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 600, marginBottom: 'var(--space-2)', letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)' }}>
          Email verified
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-10)', fontWeight: 400, lineHeight: 1.6 }}>
          Your account is now ready. You can sign in to continue.
        </p>

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--btn-primary-bg)',
            color: 'white',
            padding: '14px var(--space-5)',
            fontWeight: 600,
            fontSize: '15px',
            width: '100%',
            borderRadius: 'var(--radius-md)',
            transition: 'all var(--transition-normal)',
            minHeight: '50px',
            letterSpacing: '0.2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            opacity: 1
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--btn-primary-hover)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
          }}
        >
          Continue to login
        </Link>
      </Card>
    </PageContainer>
  );
};

export default VerifyEmail;

