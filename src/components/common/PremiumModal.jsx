import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './PremiumModal.css';

export default function PremiumModal({ isOpen, onClose }) {
  const { isPremium, upgradeToPremium, togglePremium } = useAuth();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    upgradeToPremium();
  };

  return (
    <div className="cc-modal-overlay" onClick={onClose}>
      <div className="cc-premium-modal" onClick={e => e.stopPropagation()}>
        <button className="cc-premium-close" onClick={onClose}>✕</button>

        {/* Hero Header */}
        <div className="cc-pm-header">
          <div className="cc-pm-crown">👑</div>
          <span className="cc-pm-eyebrow">CraftConnect Membership</span>
          <h2>VIP Premium Access Pass</h2>
          <p>Unlock 80+ Masterclasses, Exclusive Artisan Discounts & Free Express Delivery</p>
        </div>

        {/* Status Chip */}
        <div className="cc-pm-status-row">
          <span className={`cc-pm-badge ${isPremium ? 'active' : 'inactive'}`}>
            {isPremium ? '✨ VIP Premium Active' : '🔒 Standard Member'}
          </span>
          <button className="cc-pm-toggle-btn" onClick={togglePremium}>
            {isPremium ? 'Demo: Switch to Standard' : 'Demo: Quick Unlock VIP'}
          </button>
        </div>

        {/* Benefits Card Grid */}
        <div className="cc-pm-benefits-card">
          <h3>👑 Premium Customer Benefits</h3>
          <div className="cc-pm-grid">
            <div className="cc-pm-benefit-item">
              <span className="b-icon">🎓</span>
              <div>
                <h4>Unlimited Course Access</h4>
                <p>Full 100% access to all 80+ artisan masterclasses and video courses.</p>
              </div>
            </div>

            <div className="cc-pm-benefit-item">
              <span className="b-icon">🏷️</span>
              <div>
                <h4>Exclusive Craft Discounts</h4>
                <p>Save up to 30% on authentic silk sarees, terracotta, and hand-carved art.</p>
              </div>
            </div>

            <div className="cc-pm-benefit-item">
              <span className="b-icon">🚚</span>
              <div>
                <h4>Free Pan-India Delivery</h4>
                <p>Zero shipping & handling charges on every single order across India.</p>
              </div>
            </div>

            <div className="cc-pm-benefit-item">
              <span className="b-icon">📜</span>
              <div>
                <h4>Live Artisan Q&A & Certificate</h4>
                <p>Direct masterclass Q&A sessions with award-winning master artisans.</p>
              </div>
            </div>

            <div className="cc-pm-benefit-item">
              <span className="b-icon">🎁</span>
              <div>
                <h4>Early Drop Access</h4>
                <p>48-hour priority access to rare, limited-edition artisan heritage releases.</p>
              </div>
            </div>

            <div className="cc-pm-benefit-item">
              <span className="b-icon">🎖️</span>
              <div>
                <h4>Verified Collector Seal</h4>
                <p>Exclusive VIP collector badge on your profile and review cards.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="cc-pm-action-row">
          {!isPremium ? (
            <button className="cc-pm-cta-btn" onClick={handleUpgrade}>
              👑 Unlock Premium Pass — ₹499/Year →
            </button>
          ) : (
            <button className="cc-pm-cta-btn active" onClick={onClose}>
              ✅ VIP Access Activated — Start Exploring
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
