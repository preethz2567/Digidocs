import React from 'react';
import { Keyboard } from 'lucide-react';
import '../ui/Card.css';

const shortcuts = [
  { keys: ['Ctrl+K'], description: 'Open Command Palette' },
  { keys: ['/'], description: 'Focus document search bar' },
  { keys: ['Esc'], description: 'Clear search / Close modals' },
  { keys: ['Ctrl+A'], description: 'Select all documents' },
  { keys: ['Delete'], description: 'Delete selected documents' },
];

export const ShortcutsCard: React.FC = () => {
  return (
    <div className="card">
      <div className="card__header">
        <h2 className="card__title">
          <Keyboard size={18} strokeWidth={2} />
          Keyboard Shortcuts
        </h2>
        <p className="card__subtitle">Work faster with these keyboard shortcuts.</p>
      </div>

      <div className="card__body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {shortcuts.map((shortcut, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: idx !== shortcuts.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
              <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{shortcut.description}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {shortcut.keys.map(k => (
                  <kbd key={k} style={{ 
                    padding: '4px 8px', 
                    background: '#f3f4f6', 
                    border: '1px solid #d1d5db', 
                    borderRadius: 0, 
                    fontSize: 12, 
                    color: '#4b5563', 
                    fontFamily: 'monospace' 
                  }}>
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
