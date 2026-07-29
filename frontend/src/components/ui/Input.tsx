import React, { type InputHTMLAttributes, forwardRef } from 'react';
import { FormLabel } from './FormLabel';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, suffix, className = '', id, ...props }, ref) => {
    return (
      <div className={`input-wrapper ${className}`}>
        {label && (
          <FormLabel htmlFor={id} isRequired={required}>
            {label}
          </FormLabel>
        )}
        <div className="input-container">
          <input
            ref={ref}
            id={id}
            className={`input-field ${error ? 'has-error' : ''}`}
            aria-invalid={!!error}
            style={suffix ? { paddingRight: '40px' } : undefined}
            {...props}
          />
          {suffix && (
            <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
              {suffix}
            </div>
          )}
        </div>
        {error && <span className="input-error" role="alert">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
