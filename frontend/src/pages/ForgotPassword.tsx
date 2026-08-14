import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';

import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/ToastContext';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const { showToast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (_data: ForgotPasswordForm) => {
    try {
      // Mocking the backend call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
      showToast('Reset instructions sent to your email.', 'success');
    } catch (error) {
      showToast('Failed to send reset link. Please try again.', 'error');
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
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-5)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 600, marginBottom: 'var(--space-2)', textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)' }}>
            Reset your password
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 400, lineHeight: 1.6 }}>
            Enter your email to receive reset instructions.
          </p>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--success-color)', color: 'white', padding: 'var(--space-4)', borderRadius: 0, marginBottom: 'var(--space-6)' }}>
              Check your email for a link to reset your password.
            </div>
            <Link to="/" style={{ fontWeight: 600 }}>
              Back to Login
            </Link>
          </div>
        ) : (
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

            <Button type="submit" isLoading={isSubmitting} fullWidth style={{ marginTop: 'var(--space-2)' }}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}
      </Card>

      {!isSuccess && (
      <p style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <Link to="/" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            ← Back to login
          </Link>
        </p>
      )}
    </PageContainer>
  );
};

export default ForgotPassword;
