import React from 'react';
import './Divider.css';

interface DividerProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text }) => {
  if (!text) {
    return <hr className="divider-line" style={{ width: '100%', border: 'none', margin: '24px 0' }} />;
  }

  return (
    <div className="divider-container">
      <span className="divider-line" />
      <span className="divider-text">{text}</span>
      <span className="divider-line" />
    </div>
  );
};
