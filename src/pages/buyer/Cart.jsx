import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import PaymentModal from '../../components/common/PaymentModal';
import Footer from '../../components/common/Footer';
import BackButton from '../../components/common/BackButton';
import './Cart.css';

export default function Cart() {
  const { cartItems, removeFromCart, totalPrice, completeCheckout } = useCart();
  const navigate = useNavigate();
  const [isPayOpen, setIsPayOpen] = useState(false);

  const shipping   = totalPrice > 500 ? 0 : 50;
  const artisanFee = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + shipping + artisanFee;
  const savings    = cartItems.reduce((acc, item) => {
    const mrp = item.mrp || Math.round(Number(item.price) * 1.38);
    return acc + (mrp - Number(item.price)) * (item.quantity || 1);
  }, 0);

  const handlePaySuccess = async (details) => {
    setIsPayOpen(false);
    await completeCheckout(details);
    navigate('/my-orders');
  };

  if (cartItems.length === 0) return (
    <div className="cc-cart-page">
      <div className="cc-nav-spacer" />
      <div className="cc-container">
        <div style={{ paddingTop: 16 }}>
          <BackButton fallbackPath="/marketplace" />
        </div>
        <div className="cc-empty-state" style={{ minHeight: '60vh' }}>
          <div className="cc-empty-icon">🛒</div>
          <h3>Your Craft Bag is Empty</h3>
          <p>Add handcrafted treasures to your bag and checkout with ease</p>
          <Link to="/marketplace" className="btn-saffron" style={{ marginTop: 20, display: 'inline-block', borderRadius: 'var(--r-sm)' }}>Explore Crafts</Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="cc-cart-page">
      <div className="cc-nav-spacer" />
      <div className="cc-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 8px 0' }}>
          <BackButton fallbackPath="/marketplace" />
          <nav className="cc-breadcrumb" style={{ padding: 0 }}><Link to="/">Home</Link><span className="sep">›</span><span className="active">Shopping Bag</span></nav>
        </div>

        <div className="cc-cart-layout">
          {/* Left: Items */}
          <div className="cc-cart-items-col">
            {/* Delivery address stub */}
            <div className="cc-cart-address-stub">
              <div className="cc-cart-address-inner">
                <span className="cc-address-icon">📍</span>
                <div>
                  <div className="cc-address-title">Deliver to your address</div>
                  <div className="cc-address-sub">Add a delivery address to see delivery dates</div>
                </div>
                <button className="cc-address-change-btn">Change</button>
              </div>
            </div>

            {/* Items */}
            {cartItems.map(item => {
              const mrp = item.mrp || Math.round(Number(item.price) * 1.38);
              const disc = Math.round((1 - Number(item.price) / mrp) * 100);
              return (
                <div key={item.id} className="cc-cart-item">
                  <div className="cc-cart-item-img-wrap">
                    <img src={item.image || item.thumbnail || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300'} alt={item.name || item.title} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300'; }} />
                    {disc >= 5 && <span className="cc-cart-item-disc">{disc}% off</span>}
                  </div>
                  <div className="cc-cart-item-info">
                    <div className="cc-cart-item-cat">{item.category || 'Handcraft'}</div>
                    <h3 className="cc-cart-item-name">{item.name || item.title}</h3>
                    <p className="cc-cart-item-artisan">by {item.artisanName || item.instructor || 'Verified Artisan'}</p>
                    <div className="cc-cart-item-price-row">
                      <span className="cc-cart-item-price">₹{Number(item.price).toLocaleString('en-IN')}</span>
                      {disc >= 5 && <span className="cc-cart-item-mrp">₹{mrp.toLocaleString('en-IN')}</span>}
                    </div>
                    <p className="cc-cart-delivery-note">🚚 Free delivery · Arrives in 3–5 days</p>
                    <div className="cc-cart-item-actions">
                      <button className="cc-cart-remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                      <button className="cc-cart-save-btn">Save for later</button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Secure badges */}
            <div className="cc-cart-secure-row">
              {['🔒 100% Secure Payments', '🎨 Verified Artisans', '↩️ 7-Day Returns', '🚚 Free Delivery above ₹500'].map(b => (
                <span key={b} className="cc-cart-secure-badge">{b}</span>
              ))}
            </div>
          </div>

          {/* Right: Price Summary */}
          <aside className="cc-cart-summary">
            <div className="cc-cart-summary-head">PRICE DETAILS</div>
            <div className="cc-cart-summary-body">
              <div className="cc-summary-row">
                <span>Price ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="cc-summary-row">
                <span>Discount</span>
                <span className="cc-summary-discount">- ₹{savings.toLocaleString('en-IN')}</span>
              </div>
              <div className="cc-summary-row">
                <span>Delivery Charges</span>
                <span className={shipping === 0 ? 'cc-summary-free' : ''}>{shipping === 0 ? '🚚 FREE' : `₹${shipping}`}</span>
              </div>
              <div className="cc-summary-row">
                <span>Artisan Direct Contribution</span>
                <span>₹{artisanFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="cc-summary-divider" />
              <div className="cc-summary-total">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              {savings > 0 && (
                <div className="cc-summary-savings-banner">
                  🎉 You save ₹{savings.toLocaleString('en-IN')} on this order!
                </div>
              )}
              <button className="cc-place-order-btn" onClick={() => setIsPayOpen(true)}>
                Place Order →
              </button>
            </div>
          </aside>
        </div>
      </div>

      <PaymentModal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} onSuccess={handlePaySuccess} amount={grandTotal} />
      <Footer />
    </div>
  );
}