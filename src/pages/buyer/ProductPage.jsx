import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import PaymentModal from '../../components/common/PaymentModal';
import BackButton from '../../components/common/BackButton';
import { products as mockProducts } from '../../services/mockData';
import { apiGet } from '../../services/api';
import './ProductPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, completeCheckout } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Try Django REST backend first
        const data = await apiGet(`/products/${id}/`);
        if (data) {
          setProduct({
            id: data.id,
            name: data.title,
            price: Number(data.price),
            image: data.image_url || data.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
            category: data.category_name || "Textiles",
            artisanName: data.artisan_name || "Master Artisan",
            location: data.origin_location || "Kanchipuram, India",
            rating: 4.9,
            description: data.description || "Authentic handcrafted heritage creation.",
            stock: data.stock || 10
          });
          setSelectedImage(data.image_url || data.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800");
          setLoading(false);
          return;
        }
      } catch {
        // Fallback to local mock data
      }

      const found = mockProducts.find(p => p.id === Number(id)) || mockProducts[0];
      setProduct({
        ...found,
        location: "Kanchipuram, Tamil Nadu",
        stock: 5
      });
      setSelectedImage(found.image);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, quantity });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }
    // Do NOT call addToCart here — pass item directly to completeCheckout via modal
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsPaymentModalOpen(false);
    await completeCheckout(paymentDetails, [{ ...product, quantity }]);
    navigate('/my-orders');
  };

  if (loading) {
    return (
      <div className="product-page-loader">
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
        <p>Discovering heritage craft details...</p>
      </div>
    );
  }

  if (!product) return null;

  const galleryImages = Array.isArray(product.gallery) && product.gallery.length > 0
    ? product.gallery
    : (Array.isArray(product.images) && product.images.length > 0 
        ? product.images 
        : (product.image ? [product.image] : []));

  return (
    <div className="product-detail-wrapper">
      <div className="cc-nav-spacer" />

      {/* Toast Notification */}
      {addedToast && (
        <div className="added-toast">
          ✨ Added <strong>{product.name}</strong> to your bag!
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <BackButton fallbackPath="/marketplace" />
        <nav className="product-breadcrumb" style={{ margin: 0 }}>
          <Link to="/marketplace">Marketplace</Link> / 
          <span className="cat">{product.category}</span> / 
          <span className="active">{product.name}</span>
        </nav>
      </div>

      <div className="product-main-layout">
        {/* Gallery Section */}
        <div className="gallery-section">
          <div className="main-image-container">
            <img 
              src={selectedImage || product.image} 
              alt={product.name} 
              className="main-image"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800"; }}
            />
            <span className="craft-badge">100% Authentic Handcraft</span>
          </div>

          {galleryImages.length > 1 && (
            <div className="thumbnail-row">
              {galleryImages.map((img, idx) => (
                <button 
                  key={idx}
                  className={`thumb-btn ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img 
                    src={img} 
                    alt={`Craft Thumbnail ${idx + 1}`} 
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300"; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Column */}
        <div className="info-section">
          <span className="cat-tag">{product.category}</span>
          <h1 className="product-title">{product.name}</h1>

          <div className="rating-row">
            <span className="stars">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < Math.round(product.rating || 4.9) ? '#F5C518' : '#e0d6ca' }}>★</span>
              ))}
            </span>
            <span className="score">{(product.rating || 4.9).toFixed(1)}</span>
            <span className="dot">•</span>
            <span className="reviews-count">{product.rating_count || 48} Verified Reviews</span>
          </div>

          <div className="price-box">
            <span className="currency">₹</span>
            <span className="amount">{product.price.toLocaleString('en-IN')}</span>
            <span className="tax-note">Inclusive of all taxes & fair artisan compensation</span>
          </div>

          <p className="product-description">{product.description}</p>

          {/* Artisan Backstory Card */}
          <div className="artisan-story-card">
            <div className="artisan-avatar-wrapper">
              <span className="avatar-emoji">👩‍🎨</span>
            </div>
            <div className="artisan-meta">
              <span className="role-label">Handcrafted by Master Artisan</span>
              <h4>{product.artisanName}</h4>
              <p className="artisan-loc">📍 {product.location}</p>
            </div>
            <span className="verified-seal">✓ Verified Artisan</span>
          </div>

          {/* Guarantees Grid */}
          <div className="guarantees-grid">
            <div className="guarantee-item">
              <span className="icon">🌿</span>
              <span>100% Sustainable & Eco-Friendly</span>
            </div>
            <div className="guarantee-item">
              <span className="icon">🤝</span>
              <span>Direct Fair Trade Compensation</span>
            </div>
            <div className="guarantee-item">
              <span className="icon">📦</span>
              <span>Express Insured Shipping</span>
            </div>
          </div>

          {/* Actions */}
          <div className="purchase-controls">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>

            <button className="add-bag-btn" onClick={handleAddToCart}>
              Add to Shopping Bag
            </button>

            <button className="buy-upi-btn" onClick={handleBuyNow}>
              💳 Instant Checkout with Razorpay / UPI
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="reviews-section">
        <h2>Artisan Craft <i>Reviews</i></h2>
        <div className="reviews-grid">
          <div className="review-card">
            <div className="review-header">
              <strong>Ananya Sharma</strong>
              <span className="stars">★★★★★</span>
            </div>
            <p>"The weaving quality and handloom texture are exquisite! You can feel the heritage."</p>
            <span className="date">Verified Buyer • 2 days ago</span>
          </div>

          <div className="review-card">
            <div className="review-header">
              <strong>Vikram Malhotra</strong>
              <span className="stars">★★★★★</span>
            </div>
            <p>"Delivered beautifully packaged with an artisan hand-written note. Truly authentic!"</p>
            <span className="date">Verified Buyer • 1 week ago</span>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={product.price * quantity}
      />
    </div>
  );
};

export default ProductPage;
