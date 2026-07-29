import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, User, LogOut, Package2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './Sidebar.css';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
  >
    <span className="sidebar__icon">{icon}</span>
    {label}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const logout = useAuthStore(state => state.logout);

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <NavLink to="/dashboard" className="sidebar__brand">
          <div className="sidebar__brand-logo">
            <Package2 size={12} strokeWidth={2.5} color="#fff" />
          </div>
          <span className="sidebar__brand-name">DigiDocs</span>
        </NavLink>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__section-label">Workspace</div>
        <NavItem to="/dashboard" label="Dashboard" icon={<Home size={16} strokeWidth={2} />} end />
        <NavItem to="/documents" label="Documents" icon={<FileText size={16} strokeWidth={2} />} />

        <div className="sidebar__section-label" style={{ marginTop: 12 }}>Account</div>
        <NavItem to="/profile" label="Profile" icon={<User size={16} strokeWidth={2} />} />
      </nav>

      <div className="sidebar__footer">
        <button onClick={logout} className="sidebar__link">
          <span className="sidebar__icon"><LogOut size={16} strokeWidth={2} /></span>
          Sign out
        </button>
      </div>
    </aside>
  );
};
