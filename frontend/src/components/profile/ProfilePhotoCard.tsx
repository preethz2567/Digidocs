import React, { useRef, useState } from 'react';
import useAuthStore from '../../store/authStore';
import userService from '../../services/userService';
import { useToast } from '../ui/ToastContext';
import { Upload, Trash2, Loader2 } from 'lucide-react';

export const ProfilePhotoCard: React.FC = () => {
  const { user, fetchUser } = useAuthStore();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      showToast('Only JPG or PNG images are allowed.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5 MB.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      await userService.uploadAvatar(file);
      await fetchUser(); // Updates the authStore which cascades to Navbar and Profile
      showToast('Profile photo updated successfully.', 'success');
    } catch (error) {
      showToast('Failed to upload profile photo.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteAvatar();
      await fetchUser();
      showToast('Profile photo removed.', 'success');
    } catch {
      showToast('Failed to remove profile photo.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-card">
      <div className="profile-card__header">
        <h2 className="profile-card__title">Profile Photo</h2>
        <p className="profile-card__desc">Personalize your account with a photo.</p>
      </div>

      <div className="profile-card__content" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ position: 'relative' }}>
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt="Profile" 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5e7eb' }} 
            />
          ) : (
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f3f4f6', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '24px', fontWeight: 600, color: '#4b5563', border: '1px solid #e5e7eb' 
            }}>
              {initials}
            </div>
          )}
          {isUploading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '50%' }}>
              <Loader2 size={24} className="animate-spin" color="#111827" />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn-secondary" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Upload size={14} /> Upload New Photo
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/png, image/jpeg" 
              style={{ display: 'none' }} 
            />
            
            {user?.avatarUrl && (
              <button 
                className="btn-danger" 
                onClick={handleDelete}
                disabled={isUploading || isDeleting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #fee2e2', color: '#ef4444', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Remove Photo
              </button>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            Supported formats: PNG, JPG, JPEG. Maximum size: 5 MB.
          </p>
        </div>
      </div>
    </div>
  );
};
