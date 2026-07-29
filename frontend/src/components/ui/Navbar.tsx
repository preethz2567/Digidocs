import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User as UserIcon, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, fetchUser } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const firstInitial = userName ? userName.charAt(0).toUpperCase() : 'U';
  const firstName = userName ? userName.split(' ')[0] : 'User';

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar__left">
        <div className="navbar__search">
          <span className="navbar__search-icon">
            <Search size={14} strokeWidth={2} color="#9ca3af" />
          </span>
          <input type="text" placeholder="Search documents..." />
        </div>
      </div>

      <div className="navbar__right">
        <button className="navbar__icon-btn" aria-label="Notifications">
          <Bell size={17} strokeWidth={2} />
        </button>

        <div className="navbar__avatar-menu" ref={menuRef}>
          <button
            className="navbar__avatar-trigger"
            onClick={() => setDropdownOpen(o => !o)}
            aria-label="User menu"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="navbar__avatar-img" />
            ) : (
              <div className="navbar__avatar">{firstInitial}</div>
            )}
            <span className="navbar__avatar-name">{firstName}</span>
            <span className="navbar__avatar-chevron">
              <ChevronDown size={14} strokeWidth={2.5} color="#9ca3af" />
            </span>
          </button>

          {dropdownOpen && (
            <div className="navbar__dropdown">
              <div className="navbar__dropdown-header">
                <span className="navbar__dropdown-user">{userName}</span>
                <span className="navbar__dropdown-email">{userEmail}</span>
              </div>

              <button
                className="navbar__dropdown-item"
                onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
              >
                <UserIcon size={14} strokeWidth={2} />
                Profile
              </button>

              <div className="navbar__dropdown-divider" />

              <button
                className="navbar__dropdown-item navbar__dropdown-item--danger"
                onClick={handleLogout}
              >
                <LogOut size={14} strokeWidth={2} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
