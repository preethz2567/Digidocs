import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
      <div
        style={{
          width: '24px',
          height: '24px',
          border: '2px solid var(--border-color)',
          borderTopColor: 'var(--text-primary)',
          borderRadius: '50%',
          animation: 'btn-spin 0.6s linear infinite',
        }}
      />
    </div>
  );
};
