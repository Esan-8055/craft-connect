import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/common/BackButton';
import './LoginPage.css'; /* Shared styles */

const SignupPage = () => {
  const { register, error, clearError, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    role: 'consumer',
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setRole = (role) => {
    setForm({ ...form, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    // Basic validation
    const required = ['username', 'email', 'first_name', 'last_name', 'password', 'password2'];
    for (const field of required) {
      if (!form[field].trim()) {
        setLocalError('Please fill in all fields.');
        return;
      }
    }

    if (form.password !== form.password2) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    try {
      const userData = await register(form);
      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (userData.role === 'artisan') {
        navigate('/seller');
      } else {
        navigate('/marketplace');
      }
    } catch {
      // Error is set in AuthContext
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-viewport">
      <div className="auth-wrapper">
        <div style={{ alignSelf: 'flex-start' }}>
          <BackButton fallbackPath="/" />
        </div>
        <div className="auth-container">
        {/* Left Panel - Branding */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <span className="auth-eyebrow">Join the Community</span>
            <h1 className="auth-brand-title">Craft <i>Connect</i></h1>
            <p className="auth-brand-desc">
              Create your account to start exploring handmade treasures or set up your artisan studio.
            </p>
            <div className="auth-brand-decoration">
              <div className="deco-line"></div>
              <span>✦</span>
              <div className="deco-line"></div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-form-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="auth-form-title">Create Account</h2>
            <p className="auth-form-subtitle">Choose your role and fill in your details</p>

            {displayError && (
              <div className="auth-error-box">
                <span className="error-icon">⚠</span>
                <span>{displayError}</span>
              </div>
            )}

            {/* Role Toggle */}
            <div className="auth-field">
              <label>I want to</label>
              <div className="role-toggle">
                <button
                  type="button"
                  className={`role-option ${form.role === 'consumer' ? 'active-buyer' : ''}`}
                  onClick={() => setRole('consumer')}
                >
                  🛍️ Buy &amp; Learn
                </button>
                <button
                  type="button"
                  className={`role-option ${form.role === 'artisan' ? 'active-seller' : ''}`}
                  onClick={() => setRole('artisan')}
                >
                  🎨 Sell &amp; Teach
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="auth-field">
                <label htmlFor="signup-first">First Name</label>
                <input
                  id="signup-first"
                  name="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="signup-last">Last Name</label>
                <input
                  id="signup-last"
                  name="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password2">Confirm Password</label>
              <input
                id="signup-password2"
                name="password2"
                type="password"
                value={form.password2}
                onChange={handleChange}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              style={form.role === 'artisan' ? { background: '#2D3436' } : {}}
            >
              {loading ? (
                <span className="auth-spinner"></span>
              ) : (
                form.role === 'artisan' ? 'Create Artisan Account' : 'Create Buyer Account'
              )}
            </button>

            <p className="auth-switch-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-switch-link">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
);
};

export default SignupPage;
