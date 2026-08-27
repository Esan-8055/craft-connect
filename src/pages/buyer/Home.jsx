import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ProductCard from '../../components/marketplace/ProductCard';
import Footer from '../../components/common/Footer';
import BackButton from '../../components/common/BackButton';
import { apiGet } from '../../services/api';
import './Home.css';

const CATS = ['All', 'Textiles', 'Pottery', 'Woodwork', 'Jewelry', 'Paintings', 'Bamboo'];
const SORTS = [
  { value: 'relevance',  label: 'Relevance' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Best Rated' },
];

// ── Module-level Sidebar component (not recreated on every Home render) ──
function FilterSidebar({ cat, setCat, minP, setMinP, maxP, setMaxP, minR, setMinR, onClear }) {
  return (
    <aside className="cc-home-sidebar">
      <div className="cc-sidebar-head">
        <h3>Filters</h3>
        <button className="cc-sidebar-clear" onClick={onClear}>Clear All</button>
      </div>

      <div className="cc-sidebar-block">
        <h4>Category</h4>
        {CATS.map(c => (
          <label key={c} className="cc-sidebar-radio">
            <input type="radio" name="cat" checked={cat === c} onChange={() => setCat(c)} />
            <span>{c}</span>
          </label>
        ))}
      </div>

      <div className="cc-sidebar-block">
        <h4>Price Range (₹)</h4>
        <div className="cc-price-range">
          <input type="number" value={minP} placeholder="Min" onChange={e => setMinP(+e.target.value)} className="cc-price-input" />
          <span>–</span>
          <input type="number" value={maxP} placeholder="Max" onChange={e => setMaxP(+e.target.value)} className="cc-price-input" />
        </div>
        <input type="range" min={0} max={50000} step={100} value={maxP} onChange={e => setMaxP(+e.target.value)} className="cc-range-slider" />
        <div className="cc-range-labels"><span>₹0</span><span>₹50,000</span></div>
      </div>

      <div className="cc-sidebar-block">
        <h4>Customer Rating</h4>
        {[{v:4,l:'4★ & above'},{v:3,l:'3★ & above'},{v:0,l:'All Ratings'}].map(r => (
          <label key={r.v} className="cc-sidebar-radio">
            <input type="radio" name="rating" checked={minR === r.v} onChange={() => setMinR(r.v)} />
            <span>{r.l}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}
const MOCK = [
  { id: 1, title: 'Banarasi Silk Saree',    price: 4999, mrp: 7500, category: 'Textiles',  artisanName: 'Ramesh Kumar', rating: 4.8, rating_count: 342, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80' },
  { id: 2, title: 'Blue Pottery Vase',       price: 849,  mrp: 1200, category: 'Pottery',   artisanName: 'Sunita Devi',   rating: 4.6, rating_count: 187, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80' },
  { id: 3, title: 'Madhubani Wall Painting', price: 2299, mrp: 3500, category: 'Paintings', artisanName: 'Priya Sharma',  rating: 4.9, rating_count: 95,  image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&q=80' },
  { id: 4, title: 'Carved Teak Elephant',    price: 1999, mrp: 2800, category: 'Woodwork',  artisanName: 'Mohan Das',     rating: 4.5, rating_count: 213, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80' },
  { id: 5, title: 'Silver Oxidized Ring',    price: 399,  mrp: 699,  category: 'Jewelry',   artisanName: 'Kavita Singh',  rating: 4.3, rating_count: 456, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
  { id: 6, title: 'Bamboo Wall Basket',      price: 599,  mrp: 899,  category: 'Bamboo',    artisanName: 'Arjun Nath',   rating: 4.4, rating_count: 78,  image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' },
  { id: 7, title: 'Kantha Embroidery Shawl', price: 3499, mrp: 5000, category: 'Textiles',  artisanName: 'Meena Kumari',  rating: 4.7, rating_count: 124, image: 'https://images.unsplash.com/photo-1610473068504-266150244437?w=400&q=80' },
  { id: 8, title: 'Terracotta Planter Set',  price: 449,  mrp: 700,  category: 'Pottery',   artisanName: 'Ravi Gupta',   rating: 4.2, rating_count: 203, image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80' },
  { id: 9, title: 'Pattachitra Silk Art',    price: 5499, mrp: 8000, category: 'Paintings', artisanName: 'Sushma Devi',  rating: 4.9, rating_count: 67,  image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&q=80' },
  { id:10, title: 'Dokra Brass Figurine',    price: 1249, mrp: 1800, category: 'Woodwork',  artisanName: 'Durga Prasad', rating: 4.6, rating_count: 89,  image: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=400&q=80' },
  { id:11, title: 'Kundan Necklace Set',     price: 2799, mrp: 4200, category: 'Jewelry',   artisanName: 'Anita Verma',  rating: 4.7, rating_count: 311, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80' },
  { id:12, title: 'Bamboo Floor Lamp',       price: 1799, mrp: 2500, category: 'Bamboo',    artisanName: 'Dilip Barman', rating: 4.5, rating_count: 142, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80' },
];

const normalizeCat = (catStr) => {
  if (!catStr) return '';
  const s = typeof catStr === 'object' ? (catStr.name || catStr.title || '') : String(catStr);
  const lower = s.toLowerCase().trim();
  if (lower.includes('textile') || lower.includes('weaving') || lower.includes('saree')) return 'textiles';
  if (lower.includes('pottery') || lower.includes('clay') || lower.includes('ceramic') || lower.includes('terracotta')) return 'pottery';
  if (lower.includes('wood') || lower.includes('handicraft')) return 'woodwork';
  if (lower.includes('jewel') || lower.includes('ring') || lower.includes('necklace')) return 'jewelry';
  if (lower.includes('paint') || lower.includes('art') || lower.includes('mithila')) return 'paintings';
  if (lower.includes('bamboo') || lower.includes('cane')) return 'bamboo';
  return lower;
};

export default function Home() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialCat = params.get('cat') || 'All';
  const searchQ    = params.get('q') || '';

  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [cat, setCat]                   = useState(initialCat);
  const [sort, setSort]                 = useState('relevance');
  const [minP, setMinP]                 = useState(0);
  const [maxP, setMaxP]                 = useState(50000);
  const [minR, setMinR]                 = useState(0);
  const [mobileFilter, setMobileFilter] = useState(false);

  useEffect(() => {
    const c = new URLSearchParams(location.search).get('cat') || 'All';
    setCat(c);
  }, [location.search]);

  const loadAllProducts = useCallback(async () => {
    // 1. Instantly populate local seller & mock items (0ms load time)
    const localSeller = JSON.parse(localStorage.getItem('cc_seller_products') || '[]');
    const publishedSeller = localSeller.filter(p => p && p.is_published !== false);
    const initialCombined = [...publishedSeller, ...MOCK.filter(m => !publishedSeller.some(p => p.id === m.id))];
    setProducts(initialCombined);
    setLoading(false);

    // 2. Fetch fresh backend products in background
    try {
      const data = await apiGet('/products/').catch(() => null);
      if (data) {
        const backendItems = Array.isArray(data) ? data : (data?.results || []);
        if (backendItems.length > 0) {
          const combined = [...publishedSeller, ...backendItems, ...MOCK.filter(m => !backendItems.some(b => b.id === m.id) && !publishedSeller.some(p => p.id === m.id))];
          setProducts(combined);
        }
      }
    } catch {
      // Retains initialCombined
    }
  }, []);

  useEffect(() => {
    loadAllProducts();
    const handleSync = () => loadAllProducts();
    window.addEventListener('cc_products_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cc_products_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadAllProducts]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (searchQ) { const q = searchQ.toLowerCase(); list = list.filter(p => (p.title||p.name||'').toLowerCase().includes(q)); }
    if (cat && cat !== 'All') {
      const targetNorm = normalizeCat(cat);
      list = list.filter(p => {
        const pNorm = normalizeCat(p.category || p.category_name);
        return pNorm === targetNorm || (p.category || '').toLowerCase() === cat.toLowerCase();
      });
    }
    list = list.filter(p => { const pr = Number(p.price); return pr >= minP && pr <= maxP; });
    if (minR > 0) list = list.filter(p => (p.rating||0) >= minR);
    if (sort === 'price_asc')  list.sort((a,b) => Number(a.price) - Number(b.price));
    if (sort === 'price_desc') list.sort((a,b) => Number(b.price) - Number(a.price));
    if (sort === 'rating')     list.sort((a,b) => (b.rating||0) - (a.rating||0));
    return list;
  }, [products, searchQ, cat, sort, minP, maxP, minR]);

  const clearFilters = () => { setCat('All'); setSort('relevance'); setMinP(0); setMaxP(50000); setMinR(0); };

  return (
    <div className="cc-home-page">
      <div className="cc-nav-spacer" />
      <div className="cc-container">
        {/* Breadcrumb with BackButton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 8px 0' }}>
          <BackButton fallbackPath="/" />
          <nav className="cc-breadcrumb" style={{ padding: 0 }}>
            <Link to="/">Home</Link><span className="sep">›</span>
            <span className="active">{searchQ ? `"${searchQ}"` : cat !== 'All' ? cat : 'All Crafts'}</span>
          </nav>
        </div>

        <div className="cc-home-layout">
          {/* Desktop Sidebar */}
          <div className="hide-mobile">
            <FilterSidebar
              cat={cat} setCat={setCat}
              minP={minP} setMinP={setMinP}
              maxP={maxP} setMaxP={setMaxP}
              minR={minR} setMinR={setMinR}
              onClear={clearFilters}
            />
          </div>

          {/* Main */}
          <main className="cc-home-main">
            {/* Top bar */}
            <div className="cc-home-topbar">
              <div className="cc-home-result-count">
                {loading ? 'Loading crafts...' : <><strong>{filtered.length}</strong> handcrafted items{searchQ && <> for <em>"{searchQ}"</em></>}</>}
              </div>
              <div className="cc-home-controls">
                <button className="cc-mobile-filter-btn hide-desktop" onClick={() => setMobileFilter(true)}>⚙️ Filters</button>
                <div className="cc-sort-select">
                  <label>Sort by</label>
                  <select value={sort} onChange={e => setSort(e.target.value)}>
                    {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Category chips */}
            <div className="cc-cat-chips-row">
              {CATS.map(c => (
                <button key={c} className={`cc-cat-chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="cc-page-loader"><div className="cc-spinner" /><p>Discovering crafts...</p></div>
            ) : filtered.length === 0 ? (
              <div className="cc-empty-state">
                <div className="cc-empty-icon">🎨</div>
                <h3>No crafts found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn-outline-saffron" onClick={clearFilters} style={{ marginTop: 16 }}>Clear Filters</button>
              </div>
            ) : (
              <div className="cc-product-grid">{filtered.map(item => <ProductCard key={item.id} product={item} />)}</div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilter && (
        <>
          <div className="cc-overlay" onClick={() => setMobileFilter(false)} />
          <div className="cc-filter-drawer">
            <div className="cc-filter-drawer-head">
              <h3>Filters</h3>
              <button onClick={() => setMobileFilter(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <FilterSidebar
                cat={cat} setCat={setCat}
                minP={minP} setMinP={setMinP}
                maxP={maxP} setMaxP={setMaxP}
                minR={minR} setMinR={setMinR}
                onClear={clearFilters}
              />
            </div>
            <button className="btn-saffron" onClick={() => setMobileFilter(false)} style={{ margin: 16, borderRadius: 'var(--r-md)' }}>
              Show {filtered.length} Results
            </button>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}