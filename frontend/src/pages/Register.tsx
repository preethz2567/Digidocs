import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';

import authService from '../services/authService';

import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { useToast } from '../components/ui/ToastContext';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

// Extracts a user-readable error message from any Axios error shape
function parseAxiosError(error: any): string {
  if (!error?.response) {
    // Network error — backend not reachable
    return 'Cannot reach the server. Make sure the backend is running on port 8081.';
  }

  const data = error.response.data;
  const status = error.response.status;

  // Log full error for debugging
  console.error('[Register] HTTP', status, error.response.config?.url);
  console.error('[Register] Response body:', data);

  if (status === 400) {
    // Validation errors from @Valid — returns { errors: { field: "message" } }
    if (data?.errors && typeof data.errors === 'object') {
      const fieldMessages = Object.values(data.errors as Record<string, string>).join('. ');
      return fieldMessages || 'Validation failed. Check your input.';
    }
    // Runtime exception — returns { error: "message" }
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    return 'Invalid request. Please check your input.';
  }

  if (status === 409) return 'An account with this email already exists.';
  if (status === 500) return 'Server error. Please try again later.';

  // Fallback — use whatever the server sent
  return data?.error ?? data?.message ?? `Unexpected error (${status}).`;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      // Uses the shared axios instance (baseURL: http://localhost:8081/api)
      // Calls POST /api/users/register with { name, email, password }
      // Field name: backend RegisterRequest uses "name", not "fullName"
      await authService.register({
        name: data.fullName,
        email: data.email,
        password: data.password,
      });

      showToast('Account created! Redirecting to login…', 'success');
      setTimeout(() => navigate('/'), 1500);
    } catch (error: any) {
      const msg = parseAxiosError(error);
      setServerError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <PageContainer>
      <Card>
        {/* Card Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--text-primary)',
            color: '#ffffff',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-5)'
          }}>
            <Logo width={20} height={20} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 600, marginBottom: 'var(--space-2)', textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)' }}>
            Create your account
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 400, lineHeight: 1.6 }}>
            Start managing your documents securely.
          </p>
        </div>

        {/* Server-side error banner */}
        {serverError && (
          <div role="alert" style={{
            backgroundColor: 'var(--error-bg)',
            border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: 0,
            padding: '12px 14px',
            marginBottom: 'var(--space-5)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--error-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span style={{ fontSize: '13px', color: 'var(--error-color)', fontWeight: 500, lineHeight: 1.5 }}>
              {serverError}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column' }}>
          <Input
            id="fullName"
            type="text"
            label="Full Name"
            placeholder="John Doe"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="name@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordInput
            id="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm Password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" isLoading={isSubmitting} fullWidth style={{ marginTop: 'var(--space-2)' }}>
            {isSubmitting ? 'Creating Account…' : 'Create Account'}
          </Button>
        </form>
      </Card>

      <p style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </PageContainer>
  );
};

export default Register;