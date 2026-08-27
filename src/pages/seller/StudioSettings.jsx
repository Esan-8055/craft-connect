import React, { useState } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import BackButton from '../../components/common/BackButton';
import { useAuth } from '../../context/AuthContext';
import './SellerDashboard.css';
import './AddProduct.css'; // Shared form styling


const StudioSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    brandName: user?.first_name ? `${user.first_name}'s Craft Studio` : 'Heritage Craft Studio',
    artisanName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Artisan',
    email: user?.email || '',
    phone: '+91 98765 43210',
    location: 'Kanchipuram, Tamil Nadu',
    bio: 'Preserving 3rd generation weaving traditions with natural silk and pure zari.',
    upiId: 'artisan@upi',
  });
  const [savedToast, setSavedToast] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="seller-container">
      <Sidebar />
      <main className="add-product-main">
        <div className="form-card-wrapper">
          <header className="form-header">
            <span className="eyebrow">Studio Profile &amp; Settings</span>
            <h1 className="serif-title">Studio <i>Settings</i></h1>
            <p>Manage your artisan studio identity, contact information, and payout details.</p>
          </header>

          {savedToast && (
            <div className="form-success-box">
              ✓ Studio settings saved successfully!
            </div>
          )}

          <div className="listing-card">
            <form onSubmit={handleSubmit} className="artisan-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Brand / Studio Name</label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Artisan Master Name</label>
                  <input
                    type="text"
                    name="artisanName"
                    value={formData.artisanName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Craft Location / District</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>Payout UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleChange}
                    placeholder="e.g. name@upi"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Artisan Studio Story (Bio)</label>
                <textarea
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="publish-btn">
                Save Studio Profile
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudioSettings;
