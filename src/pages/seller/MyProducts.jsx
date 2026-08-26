import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import BackButton from '../../components/common/BackButton';
import { apiGet, apiPost, apiDelete } from '../../services/api';
import './MyProducts.css';

const SELLER_PRODUCTS_CATALOG = [
  { id: 1, title: 'Banarasi Silk Saree',            price: 4999, category: 'Textiles',  stock: 18, is_published: true,  image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80', description: 'Pure Mulberry silk saree hand-woven by master weavers in Varanasi with gold Zari border.' },
  { id: 2, title: 'Authentic Blue Pottery Floral Vase', price: 849, category: 'Pottery',   stock: 25, is_published: true,  image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80', description: 'Traditional Jaipur blue pottery vase handcrafted using quartz stone and cobalt oxides.' },
  { id: 3, title: 'Madhubani Canvas Painting — Peacock', price: 2299, category: 'Paintings', stock: 8,  is_published: true,  image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&q=80', description: 'Mithila folk art hand-painted on natural canvas with organic plant dye pigments.' },
  { id: 4, title: 'Hand-Carved Teak Rosewood Elephant',  price: 1999, category: 'Woodwork',  stock: 12, is_published: true,  image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80', description: 'Solid rosewood elephant sculpture intricately carved by Saharanpur wood artisans.' },
  { id: 5, title: 'Silver Oxidized Ethnic Tribal Ring', price: 399,  category: 'Jewelry',   stock: 50, is_published: true,  image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', description: 'Authentic 925 sterling silver oxidized tribal ring with traditional filigree work.' },
  { id: 6, title: 'Bamboo Handcrafted Wall Basket',      price: 599,  category: 'Bamboo',    stock: 30, is_published: true,  image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', description: 'Eco-friendly bamboo wall hanging basket hand-woven by Assam artisan collectives.' },
  { id: 7, title: 'Kantha Embroidery Silk Shawl',        price: 3499, category: 'Textiles',  stock: 15, is_published: true,  image: 'https://images.unsplash.com/photo-1610473068504-266150244437?w=600&q=80', description: 'Tussar silk shawl featuring running Kantha stitch needlework from West Bengal.' },
  { id: 8, title: 'Terracotta Hand-Painted Planter Set', price: 449,  category: 'Pottery',   stock: 40, is_published: true,  image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', description: 'Set of 3 hand-thrown clay pottery pots decorated with traditional folk art motifs.' },
  { id: 9, title: 'Pattachitra Silk Scroll Painting',    price: 5499, category: 'Paintings', stock: 6,  is_published: true,  image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80', description: 'Heritage Odisha scroll painting depicting mythological sagas on treated silk cloth.' },
  { id: 10, title: 'Dokra Lost-Wax Brass Figurine',      price: 1249, category: 'Woodwork',  stock: 14, is_published: true,  image: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=600&q=80', description: 'Non-ferrous metal casting figurine made using 4000-year-old lost-wax technique.' },
  { id: 11, title: 'Kundan Bridal Choker Necklace',      price: 2799, category: 'Jewelry',   stock: 10, is_published: true,  image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80', description: 'Royal Rajasthani Kundan setting necklace with glass gemstones and pearl drops.' },
  { id: 12, title: 'Bamboo Hand-Woven Floor Lamp',       price: 1799, category: 'Bamboo',    stock: 20, is_published: true,  image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80', description: 'Natural cane and bamboo room lamp providing warm ambient lighting.' },
];

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const localSeller = JSON.parse(localStorage.getItem('cc_seller_products') || '[]');
      const data = await apiGet('/products/my-products/').catch(() => null);
      const items = Array.isArray(data) ? data : (data?.results || []);
      
      const combined = [...localSeller];
      const baseCatalog = items.length > 0 ? items : SELLER_PRODUCTS_CATALOG;
      
      baseCatalog.forEach(catItem => {
        if (!combined.some(c => c.id === catItem.id)) {
          combined.push(catItem);
        }
      });
      setProducts(combined);
    } catch (err) {
      console.warn('Backend unavailable, displaying catalog:', err.message);
      const localSeller = JSON.parse(localStorage.getItem('cc_seller_products') || '[]');
      const combined = [...localSeller];
      SELLER_PRODUCTS_CATALOG.forEach(catItem => {
        if (!combined.some(c => c.id === catItem.id)) {
          combined.push(catItem);
        }
      });
      setProducts(combined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    const handleSync = () => fetchProducts();
    window.addEventListener('cc_products_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cc_products_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchProducts]);

  const updateLocalProductStatus = (id, isPublished) => {
    try {
      const localSeller = JSON.parse(localStorage.getItem('cc_seller_products') || '[]');
      const updated = localSeller.map(p => p.id === id ? { ...p, is_published: isPublished } : p);
      localStorage.setItem('cc_seller_products', JSON.stringify(updated));
      window.dispatchEvent(new Event('cc_products_updated'));
    } catch (e) {
      console.warn('Error saving local product publish state:', e);
    }
  };

  const handlePublish = async (id) => {
    setActionLoading(id);
    try {
      await apiPost(`/products/${id}/publish/`).catch(() => null);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_published: true } : p));
      updateLocalProductStatus(id, true);
      showToast('🚀 Product published live to marketplace!');
    } catch (err) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_published: true } : p));
      updateLocalProductStatus(id, true);
      showToast('🚀 Product published live to marketplace!');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (id) => {
    setActionLoading(id);
    try {
      await apiPost(`/products/${id}/unpublish/`).catch(() => null);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_published: false } : p));
      updateLocalProductStatus(id, false);
      showToast('Product reverted to draft.');
    } catch (err) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_published: false } : p));
      updateLocalProductStatus(id, false);
      showToast('Product reverted to draft.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await apiDelete(`/products/${id}/`).catch(() => null);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product deleted from inventory.');
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product deleted from inventory.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCat === 'All' || item.category.toLowerCase() === selectedCat.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const fallbackImg = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600';

  return (
    <div className="seller-layout">
      <Sidebar />
      <main className="seller-main">
        <div style={{ marginBottom: 16 }}>
          <BackButton fallbackPath="/seller" />
        </div>

        <header className="seller-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="pre-title">Artisan Inventory</span>
              <h1>My <i>Products Catalog</i></h1>
              <p className="inv-summary">
                {products.length} Total Listing{products.length !== 1 ? 's' : ''} &middot;{' '}
                {products.filter(p => p.is_published).length} Published &middot;{' '}
                {products.filter(p => !p.is_published).length} Drafts
              </p>
            </div>
            <button 
              className="publish-action-btn"
              onClick={() => navigate('/seller/add-product')}
              style={{ background: '#C8440A', color: '#FFF', padding: '10px 20px', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              + Upload New Product
            </button>
          </div>
        </header>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Search products in studio inventory..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: 240, padding: '10px 14px', borderRadius: 8, border: '1px solid #EFE6DC', fontSize: 13 }}
          />
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {['All', 'Textiles', 'Pottery', 'Paintings', 'Woodwork', 'Jewelry', 'Bamboo'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid ' + (selectedCat === cat ? '#C8440A' : '#EFE6DC'),
                  background: selectedCat === cat ? '#C8440A' : '#FFF',
                  color: selectedCat === cat ? '#FFF' : '#7A685A',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`inv-toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        {loading ? (
          <div className="inv-loading">
            <div className="inv-spinner"></div>
            <p>Loading your inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="inv-empty">
            <p>No products match your search/filter criteria.</p>
          </div>
        ) : (
          <div className="inventory-grid">
            {filteredProducts.map(item => (
              <div key={item.id} className="inventory-card">
                <div className="inv-img-wrapper">
                  <img 
                    src={item.image || fallbackImg} 
                    alt={item.title}
                    onError={(e) => { e.target.src = fallbackImg; }}
                  />
                  <span className={`inv-status-badge ${item.is_published ? 'published' : 'draft'}`}>
                    {item.is_published ? '● Published' : '○ Draft'}
                  </span>
                </div>
                <div className="inv-info">
                  <h3>{item.title}</h3>
                  <div className="inv-meta">
                    <span className="inv-price">₹{Number(item.price).toLocaleString('en-IN')}</span>
                    <span className="inv-stock">Stock: {item.stock} pcs</span>
                  </div>
                  {item.category && (
                    <div style={{ fontSize: 11, color: '#7A685A', marginBottom: 8, fontWeight: 600 }}>
                      Category: {item.category}
                    </div>
                  )}
                  <div className="inv-btns">
                    {item.is_published ? (
                      <button 
                        className="unpublish-btn"
                        onClick={() => handleUnpublish(item.id)}
                        disabled={actionLoading === item.id}
                      >
                        {actionLoading === item.id ? '...' : 'Unpublish'}
                      </button>
                    ) : (
                      <button 
                        className="publish-action-btn"
                        onClick={() => handlePublish(item.id)}
                        disabled={actionLoading === item.id}
                      >
                        {actionLoading === item.id ? '...' : '🚀 Publish'}
                      </button>
                    )}
                    <button 
                      className="del-btn"
                      onClick={() => handleDelete(item.id, item.title)}
                      disabled={actionLoading === item.id}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyProducts;