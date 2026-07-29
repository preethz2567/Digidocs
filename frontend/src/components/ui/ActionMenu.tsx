import React, { useState, useRef, useEffect } from 'react';
import './ActionMenu.css';

interface ActionMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
}

interface ActionMenuProps {
  trigger: React.ReactNode;
  items: ActionMenuItem[];
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="action-menu" ref={menuRef}>
      <button 
        className="action-menu__trigger" 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} 
        aria-label="More actions"
      >
        {trigger}
      </button>

      {isOpen && (
        <div className="action-menu__dropdown">
          {items.map((item, index) => {
            if (item.label === 'Divider') {
              return <div key={index} className="action-menu__divider"></div>;
            }
            return (
              <button
                key={index}
                className={`action-menu__item ${item.danger ? 'action-menu__item--danger' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  item.onClick();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
