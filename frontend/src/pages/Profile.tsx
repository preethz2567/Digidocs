import React from 'react';
import { ProfilePhotoCard } from '../components/profile/ProfilePhotoCard';
import { PersonalInfoCard } from '../components/profile/PersonalInfoCard';
import { SecurityCard } from '../components/profile/SecurityCard';
import { ShortcutsCard } from '../components/profile/ShortcutsCard';
import './Profile.css';

const Profile: React.FC = () => {
  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">Profile</h1>
        <p className="profile-page__subtitle">Manage your account settings.</p>
      </div>
      
      <div className="profile-page__cards">
        <ProfilePhotoCard />
        <PersonalInfoCard />
        <SecurityCard />
        <ShortcutsCard />
      </div>
    </div>
  );
};

export default Profile;