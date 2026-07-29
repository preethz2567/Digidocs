import React, { forwardRef, useState } from 'react';
import { Input } from './Input';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = 'Password', ...props }, ref) => {
    const [show, setShow] = useState(false);

    const toggleButton = (
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-tertiary)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color var(--transition-fast)'
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        )}
      </button>
    );

    return (
      <Input
        ref={ref}
        type={show ? 'text' : 'password'}
        label={label}
        suffix={toggleButton}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
