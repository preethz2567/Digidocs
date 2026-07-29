import React from 'react';
import './StatsCard.css';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, trend }) => {
  return (
    <div className="stats-card">
      <div className="stats-card__header">
        <div className="stats-card__icon">{icon}</div>
      </div>
      <div className="stats-card__value">{value}</div>
      <div className="stats-card__label">{label}</div>
      {trend && (
        <div className="stats-card__trend">
          <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          {trend}
        </div>
      )}
    </div>
  );
};
