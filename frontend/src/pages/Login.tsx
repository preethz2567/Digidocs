import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { Divider } from '../components/ui/Divider';
import { Logo } from '../components/ui/Logo';
import { useToast } from '../components/ui/ToastContext';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Extracts a user-readable error message from any Axios error shape
function parseAxiosError(error: any): string {
  if (!error?.response) {
    // Network error — backend not reachable
    return 'Cannot reach the server. Make sure the backend is running on port 8081.';
  }

  const data = error.response.data;
  const status = error.response.status;

  // Log full error for debugging
  console.error('[Login] HTTP', status, error.response.config?.url);
  console.error('[Login] Response body:', data);

  if (status === 401) {
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    return 'Invalid email or password. Please try again.';
  }

  if (status === 400) {
    if (data?.errors && typeof data.errors === 'object') {
      const fieldMessages = Object.values(data.errors as Record<string, string>).join('. ');
      return fieldMessages || 'Validation failed. Check your input.';
    }
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    return 'Invalid request. Please check your input.';
  }

  if (status === 404) return 'Account not found.';
  if (status === 500) return 'Server error. Please try again later.';

  // Fallback
  return data?.error ?? data?.message ?? `Unexpected error (${status}).`;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error: any) {
      const msg = parseAxiosError(error);
      setServerError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <PageContainer>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--text-primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-5)'
          }}>
            <Logo width={20} height={20} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 600, marginBottom: 'var(--space-2)', textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)' }}>
            Log in to DigiDocs
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 400, lineHeight: 1.6 }}>
            Secure document management for modern teams
          </p>
        </div>

        {/* Server-side error banner */}
        {serverError && (
          <div role="alert" style={{
            backgroundColor: 'var(--error-bg)',
            border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: 'var(--radius-md)',
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
            id="email"
            type="email"
            label="Email"
            placeholder="name@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label
                htmlFor="password"
                style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.3px' }}
              >
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button type="submit" isLoading={isSubmitting} fullWidth style={{ marginTop: 'var(--space-2)' }}>
            {isSubmitting ? 'Signing in...' : 'Continue'}
          </Button>
        </form>

        <Divider text="OR CONTINUE WITH" />

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="outline" fullWidth disabled style={{ opacity: 0.4, cursor: 'not-allowed', backgroundColor: '#f9fafb' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 'var(--space-2)', opacity: 0.8 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span style={{ fontWeight: 500 }}>Google</span>
          </Button>

          <Button variant="outline" fullWidth disabled style={{ opacity: 0.4, cursor: 'not-allowed', backgroundColor: '#f9fafb' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 'var(--space-2)', opacity: 0.8 }}>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            <span style={{ fontWeight: 500 }}>GitHub</span>
          </Button>
        </div>
      </Card>

      <p style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          Create account
        </Link>
      </p>
    </PageContainer>
  );
};

export default Login;