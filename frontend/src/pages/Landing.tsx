import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Share2 } from 'lucide-react';
import './Landing.css';

const Landing: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav__logo">
          <div className="landing-nav__logo-mark"></div>
          Digidocs
        </div>
        <div className="landing-nav__links">
          <a href="#features" className="landing-nav__link">Features</a>
          <a href="#security" className="landing-nav__link">Security</a>
        </div>
        <Link to="/login" className="landing-nav__cta">Sign In</Link>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero__content">
          <div className="landing-hero__badge">v2.0 Architecture</div>
          <h1 className="landing-hero__title">Enterprise Document Intelligence.</h1>
          <p className="landing-hero__desc">
            A brutalist, high-performance vault for your most critical assets. 
            Zero fluff, zero rounded corners. Pure speed and security.
          </p>
          <div className="landing-hero__buttons">
            <Link to="/register" className="btn-primary">Start for Free</Link>
            <a href="#features" className="btn-secondary">Explore Features</a>
          </div>
        </div>
        <div className="landing-hero__graphic">
          <svg className="svg-graphic anim-float" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Geometric Grid Background */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
            <rect width="400" height="400" fill="url(#grid)" />
            
            {/* Central Monolith */}
            <rect x="120" y="80" width="160" height="240" fill="#0d0d0d" stroke="#1d6ef7" strokeWidth="4" />
            
            {/* Data nodes */}
            <rect x="80" y="120" width="40" height="40" fill="#1d6ef7" className="anim-pulse" />
            <rect x="280" y="240" width="40" height="40" fill="#1d6ef7" className="anim-pulse" style={{ animationDelay: '1s' }} />
            
            {/* Connecting lines */}
            <path d="M 0 140 H 80" stroke="#0d0d0d" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 320 260 H 400" stroke="#0d0d0d" strokeWidth="2" strokeDasharray="4 4" />
            
            {/* Spinning reticle */}
            <g className="anim-spin" style={{ transformOrigin: '200px 200px' }}>
              <circle cx="200" cy="200" r="100" fill="none" stroke="#1d6ef7" strokeWidth="1" strokeDasharray="10 20" />
              <rect x="198" y="90" width="4" height="20" fill="#0d0d0d" />
              <rect x="198" y="290" width="4" height="20" fill="#0d0d0d" />
              <rect x="90" y="198" width="20" height="4" fill="#0d0d0d" />
              <rect x="290" y="198" width="20" height="4" fill="#0d0d0d" />
            </g>
          </svg>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="landing-features__header">
          <h2 className="landing-features__title">Core Infrastructure</h2>
          <p style={{ color: '#9ca3af', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            Engineered for performance and strict compliance.
          </p>
        </div>
        <div className="landing-features__grid">
          <div className="feature-card">
            <div className="feature-card__icon"><Zap size={24} /></div>
            <h3 className="feature-card__title">Lightning Fast</h3>
            <p className="feature-card__desc">
              Built on a high-performance Spring Boot backend with a lightweight React interface. Keyboard-first navigation.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon"><Shield size={24} /></div>
            <h3 className="feature-card__title">Bank-Grade Security</h3>
            <p className="feature-card__desc">
              Stateless JWT authentication and rigorous tenant isolation ensures your data remains exclusively yours.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon"><Share2 size={24} /></div>
            <h3 className="feature-card__title">Secure Sharing</h3>
            <p className="feature-card__desc">
              Generate expiring, read-only links for external collaboration without compromising internal security protocols.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
