import React from 'react';
import './SkeletonCard.css';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-line" style={{ width: '40%' }}></div>
        <div className="skeleton-icon"></div>
      </div>
      <div className="skeleton-large"></div>
    </div>
  );
};

export const SkeletonTable: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '20px', padding: '16px', backgroundColor: '#fff', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <div className="skeleton-line" style={{ width: '30px' }}></div>
          <div className="skeleton-line" style={{ width: '40%' }}></div>
          <div className="skeleton-line" style={{ width: '20%' }}></div>
          <div className="skeleton-line" style={{ width: '20%' }}></div>
          <div className="skeleton-line" style={{ width: '10%' }}></div>
        </div>
      ))}
    </div>
  );
};
