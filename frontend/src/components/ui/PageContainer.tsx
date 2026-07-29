import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import './PageContainer.css';

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="page-container">
      <nav className="page-nav">
        <Link to="/" className="page-nav-brand">
          <div className="page-nav-logo-wrap">
            <Logo width={18} height={18} />
          </div>
          DigiDocs
        </Link>
        <div className="page-nav-links">
          <Link to="#" className="page-nav-link">Help</Link>
          <Link to="#" className="page-nav-link">Support</Link>
        </div>
      </nav>

      <main className="page-main">
        <div className="page-content animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
