import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import userService from '../../services/userService';
import { useToast } from '../ui/ToastContext';

export const PersonalInfoCard: React.FC = () => {
  const { user, fetchUser } = useAuthStore();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === user?.name) return;
    
    setIsSaving(true);
    try {
      await userService.updateProfile({ name: name.trim() });
      await fetchUser();
      showToast('Profile updated successfully.', 'success');
    } catch {
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-card">
      <div className="profile-card__header">
        <h2 className="profile-card__title">Personal Information</h2>
        <p className="profile-card__desc">Update your name or view your email address.</p>
      </div>

      <form className="profile-card__form" onSubmit={handleSave}>
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
            value={user?.email || ''}
            readOnly
            title="Email cannot be changed"
          />
          <span className="profile-field__hint">Email cannot be changed.</span>
        </div>

        <div className="profile-card__actions">
          <button
            type="submit"
            className="btn-save"
            disabled={isSaving || !name.trim() || name === user?.name}
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
