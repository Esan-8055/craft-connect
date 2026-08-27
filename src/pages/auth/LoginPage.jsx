import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/common/BackButton';
import './LoginPage.css';

const DEMO_ACCOUNTS = [
  { role: 'artisan',  label: '🎨 Seller: Jaipur Pottery Studio', username: 'artisan_jaipur', password: 'ArtisanPass123!' },
  { role: 'artisan',  label: '🪡 Seller: Kanchi Silk Weaver',   username: 'artisan_kanchi', password: 'ArtisanPass123!' },
  { role: 'consumer', label: '🛍️ Buyer: Aarav Sharma',          username: 'buyer_aarav',    password: 'BuyerPass123!' },
  { role: 'consumer', label: '🛍️ Buyer: Priya Mukherjee',       username: 'buyer_priya',    password: 'BuyerPass123!' },
];

const LoginPage = () => {
  const { login, error, clearError, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');
  const initialRole = searchParams.get('role') === 'artisan' ? 'artisan' : 'consumer';

  const [loginRole, setLoginRole] = useState(initialRole);
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (searchParams.get('role') === 'artisan') {
      setLoginRole('artisan');
    }
  }, [location.search]);

  const handleFillDemo = (acc) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setLoginRole(acc.role);
    setLocalError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!username.trim() || !password.trim()) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    try {
      const userData = await login(username, password);
      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (userData.role === 'artisan') {
        navigate('/seller');
      } else {
        navigate('/marketplace');
      }
    } catch (err) {
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
              <img src="/logo.png" alt="CraftConnect Logo" className="auth-brand-logo-img" />
              <span className="auth-eyebrow">{loginRole === 'artisan' ? 'Artisan Studio Login' : 'Welcome Back'}</span>
              <h1 className="auth-brand-title">Craft <i>Connect</i></h1>
              <p className="auth-brand-desc">
                {loginRole === 'artisan'
                  ? 'Sign in to your Artisan Seller Studio to manage products, view sales analytics, and host masterclasses.'
                  : 'Sign in to access your buyer account, track orders, and discover handmade heritage crafts.'}
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
              <h2 className="auth-form-title">{loginRole === 'artisan' ? '🎨 Seller Studio Login' : '🛍️ Buyer Sign In'}</h2>
              <p className="auth-form-subtitle">Enter credentials or tap a test account below</p>

              {/* Account Type Selector Tabs */}
              <div className="auth-field" style={{ marginBottom: 18 }}>
                <div className="role-toggle">
                  <button
                    type="button"
                    className={`role-option ${loginRole === 'consumer' ? 'active-buyer' : ''}`}
                    onClick={() => setLoginRole('consumer')}
                  >
                    🛍️ Buyer Login
                  </button>
                  <button
                    type="button"
                    className={`role-option ${loginRole === 'artisan' ? 'active-seller' : ''}`}
                    onClick={() => setLoginRole('artisan')}
                  >
                    🎨 Seller Login
                  </button>
                </div>
              </div>

              {displayError && (
                <div className="auth-error-box">
                  <span className="error-icon">⚠️</span>
                  <span>{displayError}</span>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
                style={loginRole === 'artisan' ? { background: '#2D3436' } : {}}
              >
                {loading ? (
                  <span className="auth-spinner"></span>
                ) : (
                  loginRole === 'artisan' ? 'Sign In to Seller Studio →' : 'Sign In →'
                )}
              </button>

              {/* Quick Demo Fill Accounts Bar */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #EFE6DC' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7A685A', display: 'block', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  ⚡ Quick Test Demo Accounts:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {DEMO_ACCOUNTS.map((acc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleFillDemo(acc)}
                      style={{
                        background: acc.role === 'artisan' ? '#FDF0EB' : '#F0F9FF',
                        border: `1px solid ${acc.role === 'artisan' ? '#F0C4B0' : '#BAE6FD'}`,
                        color: acc.role === 'artisan' ? '#C8440A' : '#0284C7',
                        padding: '6px 8px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="auth-switch-text" style={{ marginTop: 16 }}>
                Don't have an account yet?{' '}
                <Link to={`/signup?role=${loginRole}`} className="auth-switch-link">
                  Create {loginRole === 'artisan' ? 'Artisan Account' : 'Buyer Account'}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
