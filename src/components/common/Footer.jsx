import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="cc-footer">
      {/* Trust strip */}
      <div className="cc-ft-trust">
        <div className="cc-container">
          <div className="cc-ft-trust-grid">
            {[
              { icon: '✅', title: '100% Verified Artisans', sub: 'Every seller is certified by our heritage team' },
              { icon: '🔒', title: 'Secure UPI Payments', sub: 'Pay with GPay, PhonePe, Paytm, Cards, COD' },
              { icon: '🚚', title: 'Pan-India Delivery', sub: 'Insured express shipping to every pincode' },
              { icon: '↩️', title: '7-Day Easy Returns', sub: 'No questions asked return & exchange policy' },
            ].map(t => (
              <div key={t.title} className="cc-ft-trust-item">
                <span className="cc-ft-trust-icon">{t.icon}</span>
                <div>
                  <div className="cc-ft-trust-title">{t.title}</div>
                  <div className="cc-ft-trust-sub">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="cc-ft-main">
        <div className="cc-container">
          <div className="cc-ft-grid">
            {/* Brand */}
            <div className="cc-ft-brand-col">
              <div className="cc-ft-logo-wrap">
                <img src="/logo.png" alt="CraftConnect Logo" className="cc-ft-logo-img" />
                <div className="cc-ft-logo">Craft<span>Connect</span></div>
              </div>
              <p>Bridging India's master artisans with buyers who appreciate heritage and handcraft. Every purchase preserves a tradition.</p>
            </div>

            {/* Shop */}
            <div className="cc-ft-col">
              <h4>Shop Crafts</h4>
              <Link to="/marketplace">All Handcrafts</Link>
              <Link to="/marketplace?cat=Textiles">Handloom Textiles</Link>
              <Link to="/marketplace?cat=Pottery">Pottery & Ceramics</Link>
              <Link to="/marketplace?cat=Woodwork">Wood Carving</Link>
              <Link to="/marketplace?cat=Jewelry">Silver Jewelry</Link>
              <Link to="/marketplace?cat=Paintings">Folk Paintings</Link>
            </div>

            {/* Academy */}
            <div className="cc-ft-col">
              <h4>Artisan Academy</h4>
              <Link to="/courses">All Courses</Link>
              <Link to="/courses?cat=Textiles">Textile Weaving</Link>
              <Link to="/courses?cat=Pottery">Pottery Making</Link>
              <Link to="/courses?cat=Woodwork">Wood Carving Art</Link>
              <Link to="/my-learning">My Learning</Link>
            </div>

            {/* Contact Info */}
            <div className="cc-ft-col cc-ft-contact-col">
              <h4>Contact Us</h4>
              <div className="cc-ft-contact-item">
                <span className="cc-ft-contact-icon">📧</span>
                <a href="mailto:sritharsrithar1466@gmail.com">sritharsrithar1466@gmail.com</a>
              </div>
              <div className="cc-ft-contact-item">
                <span className="cc-ft-contact-icon">📞</span>
                <a href="tel:9629452001">+91 96294 52001</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="cc-ft-bottom">
        <div className="cc-container">
          <p>© {new Date().getFullYear()} CraftConnect India. Made with ❤️ for India's artisans.</p>
        </div>
      </div>
    </footer>
  );
}
