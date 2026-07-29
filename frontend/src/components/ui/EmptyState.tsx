import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
    }}>
      {icon && (
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 6,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          marginBottom: 16
        }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: action ? 20 : 0 }}>{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
