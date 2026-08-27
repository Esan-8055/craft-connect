import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import './LandingPage.css';

const SLIDES = [
  { 
    id: 1, 
    title: 'Handloom Textiles', 
    subtitle: 'Woven stories from Varanasi, Kanchipuram & Assam', 
    path: '/marketplace?cat=Textiles', 
    cta: 'Explore Textiles', 
    badge: 'Heritage Collection', 
    emoji: '🪡', 
    bgImg: '/images/bg_handloom_textile.png',
    gradient: 'linear-gradient(135deg, rgba(35, 15, 5, 0.88) 0%, rgba(85, 30, 10, 0.82) 60%, rgba(180, 55, 10, 0.78) 100%)' 
  },
  { 
    id: 2, 
    title: 'Pottery & Clay Art', 
    subtitle: 'Blue pottery, terracotta & stoneware from master potters', 
    path: '/marketplace?cat=Pottery',  
    cta: 'Shop Pottery',   
    badge: 'Artisan Certified', 
    emoji: '🏺', 
    bgImg: '/images/bg_pottery_clay.png',
    gradient: 'linear-gradient(135deg, rgba(15, 32, 22, 0.88) 0%, rgba(35, 80, 50, 0.82) 60%, rgba(35, 110, 65, 0.78) 100%)' 
  },
  { 
    id: 3, 
    title: 'Wood Carving & Crafts', 
    subtitle: 'Exquisite hand-carved rosewood, teak wood & brass figurines', 
    path: '/marketplace?cat=Woodwork', 
    cta: 'Discover Woodwork', 
    badge: 'Master Artisans', 
    emoji: '🪵', 
    bgImg: '/images/bg_wood_carving.png',
    gradient: 'linear-gradient(135deg, rgba(40, 20, 8, 0.88) 0%, rgba(90, 40, 15, 0.82) 60%, rgba(150, 65, 20, 0.78) 100%)' 
  },
  { 
    id: 4, 
    title: 'Artisan Academy',   
    subtitle: 'Learn traditional crafts from national award winners', 
    path: '/courses',                    
    cta: 'Explore Courses', 
    badge: 'New Masterclasses', 
    emoji: '🎓', 
    bgImg: '/images/bg_artisan_academy.png',
    gradient: 'linear-gradient(135deg, rgba(25, 22, 5, 0.88) 0%, rgba(95, 80, 10, 0.82) 60%, rgba(180, 135, 10, 0.78) 100%)' 
  },
];

const CATS = [
  { name: 'Handloom Textiles', icon: '🪡', count: '2,400+ items', path: '/marketplace?cat=Textiles', color: '#FDF0EB' },
  { name: 'Pottery & Clay',    icon: '🏺', count: '1,200+ items', path: '/marketplace?cat=Pottery',  color: '#EAF5EE' },
  { name: 'Wood Carving',      icon: '🪵', count: '980+ items',   path: '/marketplace?cat=Woodwork', color: '#FFF8E1' },
  { name: 'Silver Jewelry',    icon: '💎', count: '1,600+ items', path: '/marketplace?cat=Jewelry',  color: '#F2EAF8' },
  { name: 'Folk Paintings',    icon: '🖼️', count: '760+ items',   path: '/marketplace?cat=Paintings',color: '#EAF2FF' },
  { name: 'Bamboo & Cane',     icon: '🎋', count: '430+ items',   path: '/marketplace?cat=Bamboo',   color: '#F0FAF4' },
  { name: 'Artisan Academy',   icon: '🎓', count: '80+ courses',  path: '/courses',                  color: '#FFF8E1' },
  { name: 'All Crafts',        icon: '🎨', count: 'Browse All',   path: '/marketplace',              color: '#F5EDE4' },
];

const TRENDING = [
  { id: 1, name: 'Banarasi Silk Dupatta', price: 1499, mrp: 2499, cat: 'Textiles',  rating: 4.8, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80' },
  { id: 2, name: 'Blue Pottery Vase',     price: 849,  mrp: 1200, cat: 'Pottery',   rating: 4.7, img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80' },
  { id: 3, name: 'Madhubani Wall Art',    price: 2299, mrp: 3500, cat: 'Paintings', rating: 4.9, img: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&q=80' },
  { id: 4, name: 'Teak Wood Elephant',    price: 1999, mrp: 2800, cat: 'Woodwork',  rating: 4.6, img: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80' },
  { id: 5, name: 'Silver Oxidized Ring',  price: 399,  mrp: 699,  cat: 'Jewelry',   rating: 4.5, img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
  { id: 6, name: 'Bamboo Pen Holder',     price: 299,  mrp: 499,  cat: 'Bamboo',    rating: 4.4, img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' },
];

const STATS = [
  { num: '12,000+', label: 'Artisans Verified' },
  { num: '85,000+', label: 'Happy Buyers' },
  { num: '350+',    label: 'Districts Covered' },
  { num: '4.8★',    label: 'Average Rating' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [q, setQ] = useState('');

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4800);
    return () => clearInterval(t);
  }, []);

  const disc = (p, m) => Math.round((1 - p / m) * 100);
  const onSearch = (e) => { e.preventDefault(); navigate(q.trim() ? `/marketplace?q=${encodeURIComponent(q)}` : '/marketplace'); };

  return (
    <div className="lp-root">
      <div className="cc-nav-spacer" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section 
        className="lp-hero" 
        style={{ 
          backgroundImage: `${SLIDES[slide].gradient}, url(${SLIDES[slide].bgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="cc-container">
          <div className="lp-hero-inner">
            <div className="lp-hero-text">
              <span className="lp-hero-badge">{SLIDES[slide].badge}</span>
              <h1 className="lp-hero-title">{SLIDES[slide].title}</h1>
              <p className="lp-hero-sub">{SLIDES[slide].subtitle}</p>
              <div className="lp-hero-btns">
                <Link to={SLIDES[slide].path} className="lp-hero-cta">{SLIDES[slide].cta} →</Link>
                <Link to="/signup" className="lp-hero-ghost">Join as Artisan</Link>
              </div>
            </div>
          </div>
          <div className="lp-dots">
            {SLIDES.map((_, i) => <button key={i} className={`lp-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />)}
          </div>
        </div>
      </section>

      {/* ── Search ───────────────────────────────────────────── */}
      <section className="lp-search-bar-wrap">
        <div className="cc-container">
          <form className="lp-search" onSubmit={onSearch}>
            <span className="lp-search-icon">🔍</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search for Banarasi silk, Blue pottery, Madhubani painting, wooden art..." />
            <button type="submit">Search Crafts</button>
          </form>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="lp-cats-section">
        <div className="cc-container">
          <h2 className="cc-section-title">Shop by Craft</h2>
          <div className="lp-cats-grid">
            {CATS.map(cat => (
              <Link key={cat.name} to={cat.path} className="lp-cat-item">
                <div className="lp-cat-bubble" style={{ background: cat.color }}>{cat.icon}</div>
                <span className="lp-cat-label">{cat.name}</span>
                <span className="lp-cat-count">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ─────────────────────────────────────── */}
      <section className="lp-stats-banner">
        <div className="cc-container">
          <div className="lp-stats-grid">
            {STATS.map(s => (
              <div key={s.label} className="lp-stat-item">
                <div className="lp-stat-num">{s.num}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending ─────────────────────────────────────────── */}
      <section className="lp-trending-section">
        <div className="cc-container">
          <div className="lp-section-header">
            <h2 className="cc-section-title" style={{ marginBottom: 0 }}>🔥 Trending Handcrafts</h2>
            <Link to="/marketplace" className="lp-see-all">View All →</Link>
          </div>
          <div className="lp-trending-grid">
            {TRENDING.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="lp-product-card">
                <div className="lp-product-img">
                  <img src={p.img} alt={p.name} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400'; }} />
                  <span className="lp-disc-badge">-{disc(p.price, p.mrp)}%</span>
                </div>
                <div className="lp-product-body">
                  <span className="lp-product-cat">{p.cat}</span>
                  <div className="lp-product-name">{p.name}</div>
                  <div className="lp-product-rating">
                    <span className="cc-rating-chip"><span className="star">★</span> {p.rating}</span>
                  </div>
                  <div className="lp-product-price">
                    <span className="lp-price">₹{p.price.toLocaleString('en-IN')}</span>
                    <span className="lp-mrp">₹{p.mrp.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="lp-features-section">
        <div className="cc-container">
          <h2 className="cc-section-title" style={{ textAlign: 'center' }}>Why Choose CraftConnect?</h2>
          <div className="lp-features-grid">
            {[
              { icon: '🎨', title: 'Authentic Heritage', desc: 'Every craft is verified by our cultural heritage team — 100% authentic handmade products.' },
              { icon: '🤝', title: 'Direct Artisan Trade', desc: 'No middlemen. Your purchase goes directly to the artisan\'s family and community.' },
              { icon: '📜', title: 'Craft Stories', desc: 'Every product comes with the artisan\'s story, technique heritage, and origin certificate.' },
              { icon: '🌿', title: 'Eco-Conscious', desc: 'All crafts use natural, sustainable materials with zero industrial process.' },
            ].map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Artisan CTA ──────────────────────────────────────── */}
      <section className="lp-artisan-cta">
        <div className="cc-container">
          <div className="lp-artisan-cta-inner">
            <div className="lp-artisan-cta-text">
              <span className="lp-artisan-eyebrow">Calling All Artisans</span>
              <h2>Share Your Craft with India</h2>
              <p>Join 12,000+ verified artisans already selling on CraftConnect. Free to register — start earning in 24 hours.</p>
              <div className="lp-artisan-cta-btns">
                <Link to="/signup?role=artisan" className="btn-saffron" style={{ display: 'inline-block', borderRadius: 'var(--r-sm)' }}>Start Selling Free →</Link>
                <Link to="/courses" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Learn how it works</Link>
              </div>
            </div>
            <div className="lp-artisan-cta-emojis">🪡 🏺 🪵 💎 🖼️ 🎋</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}