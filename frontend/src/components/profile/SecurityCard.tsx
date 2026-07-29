import React, { useState } from 'react';
import userService from '../../services/userService';
import { useToast } from '../ui/ToastContext';

export const SecurityCard: React.FC = () => {
  const { showToast } = useToast();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setIsSaving(true);
    try {
      await userService.changePassword({ oldPassword, newPassword });
      showToast('Password updated successfully.', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      showToast('Failed to update password. Check your current password.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-card">
      <div className="profile-card__header">
        <h2 className="profile-card__title">Security</h2>
        <p className="profile-card__desc">Update your password to keep your account secure.</p>
      </div>

      <form className="profile-card__form" onSubmit={handleChangePassword}>
        <div className="profile-field">
          <label htmlFor="old-password" className="profile-field__label">Current Password</label>
          <input
            id="old-password"
            className="profile-field__input"
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
        </div>

        <div className="profile-field">
          <label htmlFor="new-password" className="profile-field__label">New Password</label>
          <input
            id="new-password"
            className="profile-field__input"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
        </div>

        <div className="profile-field">
          <label htmlFor="confirm-password" className="profile-field__label">Confirm New Password</label>
          <input
            id="confirm-password"
            className="profile-field__input"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="profile-field__error">{error}</p>
        )}

        <div className="profile-card__actions">
          <button
            type="submit"
            className="btn-save"
            disabled={isSaving || !oldPassword || !newPassword || !confirmPassword}
          >
            {isSaving ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};
