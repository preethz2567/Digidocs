import React from 'react';
import './SkeletonCard.css';

export const SkeletonCard: React.FC = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-card__header">
      <div className="skeleton-line" style={{ width: '45%' }} />
      <div className="skeleton-icon" />
    </div>
    <div className="skeleton-value" />
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div className="skeleton-table" aria-hidden="true">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="skeleton-row">
        <div className="skeleton-line" style={{ width: '28px' }} />
        <div className="skeleton-line" style={{ width: '40%' }} />
        <div className="skeleton-line" style={{ width: '15%' }} />
        <div className="skeleton-line" style={{ width: '18%' }} />
        <div className="skeleton-line" style={{ width: '28px' }} />
      </div>
    ))}
  </div>
);

export const SkeletonProfile: React.FC = () => (
  <div className="skeleton-profile" aria-hidden="true">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="skeleton-card" style={{ marginBottom: '24px' }}>
        <div className="skeleton-card__header">
          <div className="skeleton-line" style={{ width: '35%' }} />
        </div>
        <div className="skeleton-row" style={{ paddingTop: '20px' }}>
          <div className="skeleton-line" style={{ width: '100%', height: '38px' }} />
        </div>
        <div className="skeleton-row">
          <div className="skeleton-line" style={{ width: '100%', height: '38px' }} />
        </div>
      </div>
    ))}
  </div>
);
