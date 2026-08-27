import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const FEATURED_COURSES = [
  { id: 1, title: 'Handloom Weaving Masterclass', cat: 'Textiles', icon: '🪡' },
  { id: 2, title: 'Blue Pottery Art from Scratch', cat: 'Pottery', icon: '🏺' },
  { id: 3, title: 'Madhubani Painting Traditions', cat: 'Paintings', icon: '🖼️' },
  { id: 4, title: 'Wood Carving — Advanced Craft', cat: 'Woodwork', icon: '🪵' },
  { id: 5, title: 'Bamboo Craft & Cane Weaving', cat: 'Bamboo', icon: '🎋' },
  { id: 6, title: 'Silver Jewelry Making Basics', cat: 'Jewelry', icon: '💎' },
];

const BUYER_CATS = [
  { label: 'All Crafts',  icon: '🎨', path: '/marketplace' },
  { label: 'Textiles',    icon: '🪡', path: '/marketplace?cat=Textiles' },
  { label: 'Pottery',     icon: '🏺', path: '/marketplace?cat=Pottery' },
  { label: 'Woodwork',    icon: '🪵', path: '/marketplace?cat=Woodwork' },
  { label: 'Jewelry',     icon: '💎', path: '/marketplace?cat=Jewelry' },
  { label: 'Paintings',   icon: '🖼️', path: '/marketplace?cat=Paintings' },
  { label: 'Bamboo',      icon: '🎋', path: '/marketplace?cat=Bamboo' },
  { label: 'Academy Courses', icon: '🎓', path: '/courses', isHighlighted: true },
];

const SELLER_CATS = [
  { label: 'Dashboard',   icon: '📊', path: '/seller' },
  { label: 'My Products', icon: '🛍️', path: '/seller/products' },
  { label: '+ Product',   icon: '➕', path: '/seller/add-product' },
  { label: 'My Courses',  icon: '🎓', path: '/seller/courses' },
  { label: '+ Course',    icon: '📚', path: '/seller/add-course' },
];

export default function Navbar() {
  const { user, logout, isBuyer, isSeller } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery]         = useState('');
  const [userDrop, setUserDrop]   = useState(false);
  const [courseDrop, setCourseDrop] = useState(false);
  const [drawer, setDrawer]       = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth <= 768);
  const dropRef = useRef(null);
  const courseDropRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setUserDrop(false);
      if (courseDropRef.current && !courseDropRef.current.contains(e.target)) setCourseDrop(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    setDrawer(false);
    setUserDrop(false);
    setCourseDrop(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/marketplace?q=${encodeURIComponent(query.trim())}` : '/marketplace');
    setQuery('');
  };

  const handleLogout = () => { logout(); setUserDrop(false); setDrawer(false); navigate('/'); };
  const name = user ? (user.first_name || user.username || 'User') : '';
  const cats = isSeller ? SELLER_CATS : BUYER_CATS;
  const isActiveCat = (path) => {
    if (path === '/marketplace' && location.pathname === '/marketplace' && !location.search.includes('cat')) return true;
    return location.pathname + location.search === path || location.pathname === path;
  };

  /* ── DESKTOP ─────────────────────────────────────────────── */
  if (!isMobile) return (
    <header className="cc-navbar">
      {/* Top Bar */}
      <div className="cc-nav-top">
        <Link to="/" className="cc-brand">
          <img src="/logo.png" alt="CraftConnect Logo" className="cc-brand-logo" />
          <div className="cc-brand-text">
            <span className="cc-brand-name">Craft<span>Connect</span></span>
            <span className="cc-brand-sub">India's Artisan Marketplace</span>
          </div>
        </Link>

        {/* Search */}
        <form className="cc-nav-search" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search handcrafted pottery, silk sarees, wooden art..."
          />
          <button type="submit" className="cc-nav-search-btn">🔍</button>
        </form>

        {/* Right Actions */}
        <div className="cc-nav-actions">
          {/* Offered Courses Dropdown */}
          <div className="cc-user-wrapper" ref={courseDropRef}>
            <button 
              className="cc-user-trigger cc-courses-trigger" 
              onClick={() => setCourseDrop(v => !v)}
              title="Explore offered masterclasses"
            >
              <span className="nav-icon">🎓</span>
              <span className="nav-label" style={{ color: '#F4A261', fontWeight: 700 }}>Courses ▾</span>
            </button>
            {courseDrop && (
              <div className="cc-dropdown cc-courses-dropdown">
                <div className="cc-dropdown-head" style={{ background: '#2C1A10', borderBottom: '1px solid #3d2618' }}>
                  <div className="dh-name">🎓 Offered Academy Masterclasses</div>
                  <div className="dh-email">Learn directly from national award-winning artisans</div>
                </div>
                {FEATURED_COURSES.map(c => (
                  <Link 
                    key={c.id} 
                    to={`/course/${c.id}`} 
                    className="cc-dd-item"
                    onClick={() => setCourseDrop(false)}
                  >
                    <span className="dd-icon">{c.icon}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{c.title}</span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{c.cat} Masterclass</span>
                    </div>
                  </Link>
                ))}
                <div className="cc-dd-sep" />
                <Link 
                  to="/courses" 
                  className="cc-dd-item" 
                  style={{ color: '#C8440A', fontWeight: 700, background: '#FDF0EB' }}
                  onClick={() => setCourseDrop(false)}
                >
                  <span className="dd-icon">📚</span>
                  View All 80+ Courses →
                </Link>
              </div>
            )}
          </div>

          {user ? (
            <>
              {/* User dropdown */}
              <div className="cc-user-wrapper" ref={dropRef}>
                <button className="cc-user-trigger" onClick={() => setUserDrop(v => !v)}>
                  <span className="nav-icon">👤</span>
                  <span className="nav-label">{name} ▾</span>
                </button>
                {userDrop && (
                  <div className="cc-dropdown">
                    <div className="cc-dropdown-head">
                      <div className="dh-name">Hello, {name}</div>
                      <div className="dh-email">{user.email || ''}</div>
                    </div>
                    {isBuyer && <>
                      <Link to="/my-orders"   className="cc-dd-item" onClick={() => setUserDrop(false)}><span className="dd-icon">📦</span>My Orders</Link>
                      <Link to="/my-learning" className="cc-dd-item" onClick={() => setUserDrop(false)}><span className="dd-icon">🎓</span>My Learning</Link>
                      <Link to="/cart"        className="cc-dd-item" onClick={() => setUserDrop(false)}><span className="dd-icon">🛒</span>My Cart</Link>
                    </>}
                    {isSeller && <>
                      <Link to="/seller"          className="cc-dd-item" onClick={() => setUserDrop(false)}><span className="dd-icon">📊</span>Dashboard</Link>
                      <Link to="/seller/products" className="cc-dd-item" onClick={() => setUserDrop(false)}><span className="dd-icon">🛍️</span>My Products</Link>
                    </>}
                    <div className="cc-dd-sep" />
                    <button className="cc-dd-item logout" onClick={handleLogout}><span className="dd-icon">🚪</span>Logout</button>
                  </div>
                )}
              </div>

              {/* Cart (buyers only) */}
              {isBuyer && (
                <Link to="/cart" className="cc-nav-action">
                  <span className="nav-icon">🛒</span>
                  <span className="nav-label">Cart</span>
                  {cartCount > 0 && <span className="cc-nav-cart-badge">{cartCount}</span>}
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login?role=artisan" className="cc-nav-action" style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 6, padding: '5px 12px' }}>
                <span className="nav-icon">🎨</span>
                <span className="nav-label" style={{ color: '#FFD700', fontWeight: 700, fontSize: 13 }}>Seller Login</span>
              </Link>
              <Link to="/login"  className="cc-nav-action"><span className="nav-icon">👤</span><span className="nav-label">Sign In</span></Link>
              <Link to="/signup" className="cc-nav-action" style={{ background: 'var(--saffron)', borderRadius: 6, padding: '6px 16px' }}>
                <span className="nav-label" style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Category Strip */}
      <nav className="cc-cat-strip">
        {cats.map(c => (
          <Link 
            key={c.path} 
            to={c.path} 
            className={`cc-cat-link ${isActiveCat(c.path) ? 'active' : ''} ${c.isHighlighted ? 'highlighted-cat' : ''}`}
          >
            <span className="cc-cat-icon">{c.icon}</span>{c.label}
          </Link>
        ))}
      </nav>
    </header>
  );

  /* ── MOBILE ──────────────────────────────────────────────── */
  return (
    <>
      <header className="cc-navbar">
        <div className="cc-mobile-nav">
          <button className="cc-mobile-btn" onClick={() => setDrawer(true)} style={{ fontSize: 22, color: '#fff' }}>☰</button>
          <Link to="/" className="cc-mobile-brand">
            <img src="/logo.png" alt="CraftConnect Logo" className="cc-mobile-logo" />
            <span>Craft<span>Connect</span></span>
          </Link>
          <div className="cc-mobile-right">
            <Link to="/" className="cc-mobile-btn" title="Home">
              <span style={{ fontSize: 20 }}>🏠</span>
            </Link>
            {isBuyer && (
              <Link to="/cart" className="cc-mobile-btn" style={{ position: 'relative' }} title="Cart">
                <span style={{ fontSize: 20 }}>🛒</span>
                {cartCount > 0 && <span className="cc-nav-cart-badge">{cartCount}</span>}
              </Link>
            )}
          </div>
        </div>
        {/* Category Strip for Mobile */}
        <nav className="cc-cat-strip">
          {cats.map(c => (
            <Link 
              key={c.path} 
              to={c.path} 
              className={`cc-cat-link ${isActiveCat(c.path) ? 'active' : ''} ${c.isHighlighted ? 'highlighted-cat' : ''}`}
            >
              <span className="cc-cat-icon">{c.icon}</span>{c.label}
            </Link>
          ))}
        </nav>
      </header>

      {drawer && (
        <>
          <div className="cc-overlay" onClick={() => setDrawer(false)} />
          <div className="cc-drawer">
            <div className="cc-drawer-head">
              {user ? (
                <><div className="cc-drawer-name">Hello, {name}</div><div className="cc-drawer-email">{user.email}</div></>
              ) : (
                <div className="cc-drawer-name">Welcome to CraftConnect</div>
              )}
            </div>

            <div className="cc-drawer-section-label">Navigation</div>
            <Link to="/" className="cc-drawer-item"><span className="di-icon">🏠</span>Home</Link>

            {!user && (
              <>
                <div className="cc-drawer-section-label">Account</div>
                <Link to="/login"  className="cc-drawer-item"><span className="di-icon">🔑</span>Login</Link>
                <Link to="/signup" className="cc-drawer-item"><span className="di-icon">📝</span>Sign Up</Link>
                <div className="cc-drawer-sep" />
              </>
            )}

            {isBuyer && (
              <>
                <div className="cc-drawer-section-label">Shop</div>
                <Link to="/marketplace" className="cc-drawer-item"><span className="di-icon">🎨</span>All Crafts</Link>
                <Link to="/courses"     className="cc-drawer-item"><span className="di-icon">🎓</span>Academy</Link>
                <Link to="/cart"        className="cc-drawer-item"><span className="di-icon">🛒</span>Cart {cartCount > 0 && `(${cartCount})`}</Link>
                <Link to="/my-orders"   className="cc-drawer-item"><span className="di-icon">📦</span>My Orders</Link>
                <Link to="/my-learning" className="cc-drawer-item"><span className="di-icon">📚</span>My Learning</Link>
                <div className="cc-drawer-sep" />
              </>
            )}

            {isSeller && (
              <>
                <div className="cc-drawer-section-label">Seller</div>
                <Link to="/seller"             className="cc-drawer-item"><span className="di-icon">📊</span>Dashboard</Link>
                <Link to="/seller/products"    className="cc-drawer-item"><span className="di-icon">🛍️</span>My Products</Link>
                <Link to="/seller/add-product" className="cc-drawer-item"><span className="di-icon">➕</span>Add Product</Link>
                <div className="cc-drawer-sep" />
              </>
            )}

            {user && <button className="cc-drawer-item logout" onClick={handleLogout}><span className="di-icon">🚪</span>Logout</button>}
          </div>
        </>
      )}
    </>
  );
}