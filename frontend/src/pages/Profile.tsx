import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import { useToast } from '../components/ui/ToastContext';
import './Profile.css';

const Profile: React.FC = () => {
  const { showToast } = useToast();

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        if (data?.name) setName(data.name);
        if (data?.email) setEmail(data.email);
      } catch {
        showToast('Failed to load profile.', 'error');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setProfileSaving(true);
    try {
      await userService.updateProfile({ name: name.trim(), email });
      showToast('Profile updated successfully.', 'success');
    } catch {
      showToast('Failed to update profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    setPasswordSaving(true);
    try {
      await userService.changePassword({ oldPassword, newPassword });
      showToast('Password changed successfully.', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      showToast('Failed to change password. Check your current password.', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const initials = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">Profile</h1>
        <p className="profile-page__subtitle">Manage your account details and security.</p>
      </div>

      <div className="profile-page__cards">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-card__header">
            <h2 className="profile-card__title">Personal Information</h2>
            <p className="profile-card__desc">Update your name or email address.</p>
          </div>

          {profileLoading ? (
            <div className="profile-card__loading">Loading…</div>
          ) : (
            <form className="profile-card__form" onSubmit={handleSaveProfile}>
              <div className="profile-card__avatar-row">
                <div className="profile-card__avatar">{initials}</div>
                <div>
                  <div className="profile-card__avatar-name">{name || '—'}</div>
                  <div className="profile-card__avatar-email">{email || '—'}</div>
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="profile-name" className="profile-field__label">Full Name</label>
                <input
                  id="profile-name"
                  className="profile-field__input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email" className="profile-field__label">Email Address</label>
                <input
                  id="profile-email"
                  className="profile-field__input profile-field__input--readonly"
                  type="email"
                  value={email}
                  readOnly
                  title="Email cannot be changed"
                />
                <span className="profile-field__hint">Email cannot be changed.</span>
              </div>

              <div className="profile-card__actions">
                <button
                  type="submit"
                  className="btn-save"
                  disabled={profileSaving || !name.trim()}
                >
                  {profileSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Card */}
        <div className="profile-card">
          <div className="profile-card__header">
            <h2 className="profile-card__title">Security</h2>
            <p className="profile-card__desc">Change your account password.</p>
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

            {passwordError && (
              <p className="profile-field__error">{passwordError}</p>
            )}

            <div className="profile-card__actions">
              <button
                type="submit"
                className="btn-save"
                disabled={passwordSaving || !oldPassword || !newPassword || !confirmPassword}
              >
                {passwordSaving ? 'Updating…' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;