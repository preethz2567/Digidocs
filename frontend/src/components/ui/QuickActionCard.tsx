import React from 'react';
import './QuickActionCard.css';

interface QuickActionCardProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ label, icon, onClick }) => {
  return (
    <button className="quick-action-card" onClick={onClick}>
      <div className="quick-action-card__icon">{icon}</div>
      <span className="quick-action-card__label">{label}</span>
    </button>
  );
};
