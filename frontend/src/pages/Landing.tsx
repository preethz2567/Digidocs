import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Share2 } from 'lucide-react';
import './Landing.css';
import heroGraphic from '../assets/hero-graphic.png';

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
          <img src={heroGraphic} alt="Secure Vault Graphic" className="anim-float" style={{ width: '100%', height: 'auto', border: '1px solid #374151', display: 'block' }} />
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

      {/* CTA Section */}
      <section className="landing-cta">
        <h2 className="landing-cta__title">Ready to secure your documents?</h2>
        <p className="landing-cta__desc">Join thousands of enterprises leveraging our modern architecture.</p>
        <Link to="/register" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 32px', fontSize: '16px' }}>
          Get Started Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__content">
          <div className="landing-footer__brand">
            <div className="landing-footer__logo-mark"></div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>Digidocs</span>
            <p style={{ marginTop: '12px', color: '#9ca3af', fontSize: '14px', lineHeight: 1.5 }}>
              Enterprise-grade document management.<br/>
              Built for speed and strict compliance.
            </p>
          </div>
          
          <div className="landing-footer__links">
            <div className="landing-footer__column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#security">Security</a>
              <a href="#">Integrations</a>
            </div>
            <div className="landing-footer__column">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
            <div className="landing-footer__column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div className="landing-footer__bottom">
          &copy; {new Date().getFullYear()} Digidocs Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
