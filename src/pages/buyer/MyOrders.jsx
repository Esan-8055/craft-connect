import React, { useState, useEffect, useMemo } from 'react';
import { useCart, readStoredOrders } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { socket } from '../../services/socket';
import Footer from '../../components/common/Footer';
import BackButton from '../../components/common/BackButton';
import InvoiceModal from '../../components/common/InvoiceModal';
import './MyOrders.css';

const STATUS_STEPS = ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

function getStep(status) {
  const s = (status || 'confirmed').toLowerCase();
  if (s.includes('deliver')) return 4;
  if (s.includes('out'))     return 3;
  if (s.includes('ship'))    return 2;
  if (s.includes('process') || s.includes('confirm')) return 1;
  return 0; // 'pending' stays at step 0 — Confirmed dot will pulse
}

export default function MyOrders() {
  const { myOrders, loadingOrders, refreshOrders } = useCart();
  const [activeTab, setActiveTab] = useState('All Orders');
  const [sharedOrders, setSharedOrders] = useState([]);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    if (refreshOrders) {
      refreshOrders(false); // Initial load shows spinner
      // Poll backend in background
      const poll = setInterval(() => refreshOrders(true), 5000);
      return () => clearInterval(poll);
    }
  }, [refreshOrders]);

  useEffect(() => {
    const loadShared = () => {
      const shared = readStoredOrders();
      setSharedOrders(shared);
    };
    loadShared();

    // Listen to Socket.io status updates from the seller portal
    const handleSocketUpdate = (data) => {
      const { orderId, status, trackingNumber } = data;
      if (orderId) {
        const normId = String(orderId).replace('ORD-', '').replace('CC-', '');
        setStatusOverrides(prev => ({
          ...prev,
          [normId]: { status, trackingNumber }
        }));
      }
      loadShared();
      if (refreshOrders) refreshOrders(true);
    };
    socket.on('order_status_updated', handleSocketUpdate);
    window.addEventListener('cc_orders_updated', loadShared);
    window.addEventListener('storage', loadShared);
    return () => {
      socket.off('order_status_updated', handleSocketUpdate);
      window.removeEventListener('cc_orders_updated', loadShared);
      window.removeEventListener('storage', loadShared);
    };
  }, [refreshOrders]);

  const allCombinedOrders = useMemo(() => {
    const list = (myOrders || []).map(o => {
      const normId = String(o.orderId || o.id).replace('ORD-', '').replace('CC-', '');

      // 1. Socket.io overrides take first priority
      const override = statusOverrides[normId];
      if (override) {
        return { ...o, status: override.status, trackingNumber: override.trackingNumber || o.trackingNumber };
      }

      // 2. Shared storage status takes second priority
      const sharedMatch = sharedOrders.find(s => String(s.id).replace('ORD-', '') === normId);
      if (sharedMatch) {
        const backendStep = getStep(o.status);
        const localStep   = getStep(sharedMatch.status);
        return {
          ...o,
          status:         backendStep >= localStep ? o.status : sharedMatch.status,
          trackingNumber: o.trackingNumber || sharedMatch.trackingNumber,
        };
      }
      return o;
    });

    // Append local-only orders not yet in backend list
    sharedOrders.forEach(shared => {
      if (!shared || !shared.id) return;
      const normSharedId = String(shared.id).replace('ORD-', '').replace('CC-', '');
      if (!list.some(o => String(o.orderId || o.id).replace('ORD-', '').replace('CC-', '') === normSharedId)) {
        const override = statusOverrides[normSharedId];
        list.push({
          orderId:        shared.id,
          id:             shared.id,
          date:           shared.date,
          status:         override ? override.status : (shared.status || 'Processing'),
          paymentMethod:  shared.paymentMethod || 'UPI',
          paymentTxn:     shared.transactionId || null,
          // ── Correct field names matching CartContext shared entries ──
          productTitle:   shared.productTitle  || 'Craft Product',
          productImage:   shared.productImage  || '',
          artisanName:    shared.artisanName   || 'CraftConnect Artisan Studio',
          amount:         shared.amount        || 0,
          quantity:       shared.quantity      || 1,
          customerName:   shared.customerName  || 'Craft Buyer',
          email:          shared.email         || '',
          phone:          shared.phone         || '',
          shippingAddress: shared.shippingAddress || '',
          trackingNumber: shared.trackingNumber || '',
        });
      }
    });
    return list;
  }, [myOrders, sharedOrders, statusOverrides]);

  const openInvoice = (order) => {
    // Normalise order fields for InvoiceModal
    const normalized = {
      id:             order.orderId || order.id,
      date:           order.date,
      customerName:   order.customerName  || 'Craft Buyer',
      email:          order.email         || 'buyer@craftconnect.app',
      phone:          order.phone         || '+91 98765 43210',
      shippingAddress: order.shippingAddress || 'India',
      productTitle:   order.productTitle  || order.name || order.title || 'Craft Product',
      quantity:       order.quantity      || 1,
      amount:         Number(order.amount || order.price || order.totalAmount || 0),
      trackingNumber: order.trackingNumber || '',
    };
    setInvoiceOrder(normalized);
    setIsInvoiceOpen(true);
  };

  if (loadingOrders && allCombinedOrders.length === 0) return (
    <div className="cc-orders-page">
      <div className="cc-nav-spacer" />
      <div className="cc-container">
        <div className="cc-page-loader"><div className="cc-spinner" /><p>Loading your orders...</p></div>
      </div>
      <Footer />
    </div>
  );

  if (!allCombinedOrders || allCombinedOrders.length === 0) return (
    <div className="cc-orders-page">
      <div className="cc-nav-spacer" />
      <div className="cc-container">
        <div style={{ paddingTop: 16 }}>
          <BackButton fallbackPath="/marketplace" />
        </div>
        <div className="cc-empty-state" style={{ minHeight: '60vh' }}>
          <div className="cc-empty-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>Your handcrafted orders will appear here after you place them.</p>
          <Link to="/marketplace" className="btn-saffron" style={{ marginTop: 20, display: 'inline-block', borderRadius: 'var(--r-sm)' }}>Shop Now</Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  const filteredOrders = allCombinedOrders.filter(order => {
    if (activeTab === 'All Orders') return true;
    const status = (order.status || '').toLowerCase();
    if (activeTab === 'Active')    return !status.includes('deliver') && !status.includes('cancel');
    if (activeTab === 'Delivered') return status.includes('deliver');
    if (activeTab === 'Cancelled') return status.includes('cancel');
    return true;
  });

  return (
    <div className="cc-orders-page">
      <div className="cc-nav-spacer" />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={invoiceOrder}
      />

      <div className="cc-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 8px 0' }}>
          <BackButton fallbackPath="/marketplace" />
          <nav className="cc-breadcrumb" style={{ padding: 0 }}>
            <Link to="/">Home</Link><span className="sep">›</span><span className="active">My Orders</span>
          </nav>
        </div>
        <h1 className="cc-orders-title">My Orders</h1>
        <p className="cc-orders-sub">Track your handcrafted treasures from the artisan's studio to your doorstep</p>

        {/* Filter tabs */}
        <div className="cc-orders-tabs">
          {['All Orders', 'Active', 'Delivered', 'Cancelled'].map(t => (
            <button key={t} className={`cc-orders-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>

        {/* Orders list */}
        <div className="cc-orders-list">
          {filteredOrders.length === 0 ? (
            <div className="cc-empty-state" style={{ padding: '40px 0' }}>
              <p>No orders matching "{activeTab}" filter.</p>
            </div>
          ) : (
            filteredOrders.map((order, idx) => {
              const step  = getStep(order.status);
              // ── Field-safe reads: support both backend and local-storage orders ──
              const displayName  = order.productTitle || order.name || order.title  || `Craft Order #${idx + 1}`;
              const displayImage = order.productImage  || order.image || '';
              const displayPrice = Number(order.amount || order.price || order.totalAmount || 0);

              return (
                <div key={order.orderId || order.id || idx} className="cc-order-card">
                  {/* Order header */}
                  <div className="cc-order-card-head">
                    <div className="cc-order-meta">
                      <span className="cc-order-id">Order #{order.orderId || order.id || `CC-${1000 + idx}`}</span>
                      <span className="cc-order-date">{order.date || new Date().toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="cc-order-badges">
                      <span className="cc-badge cc-badge-green">💳 {order.paymentMethod || 'UPI'} Paid</span>
                      {order.paymentTxn && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Txn: {order.paymentTxn}</span>}
                    </div>
                  </div>

                  {/* Item row */}
                  <div className="cc-order-item-row">
                    <div className="cc-order-item-img">
                      {displayImage ? (
                        <img src={displayImage} alt={displayName} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200'; }} />
                      ) : (
                        <div className="cc-order-img-placeholder">🛍️</div>
                      )}
                    </div>
                    <div className="cc-order-item-details">
                      <h3>{displayName}</h3>
                      <p className="cc-order-artisan">by {order.artisanName || 'Verified Artisan'}</p>
                      <div className="cc-order-price">₹{displayPrice.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="cc-order-actions-col">
                      <button
                        className="cc-order-track-btn"
                        onClick={() => {
                          const trk = order.trackingNumber;
                          if (trk) {
                            window.open(`https://www.indiapost.gov.in/VAS/Pages/trackconsignment.aspx`, '_blank');
                          } else {
                            alert(`Tracking will be available once your order is shipped.\nCurrent status: ${order.status || 'Processing'}`);
                          }
                        }}
                      >
                        📦 Track
                      </button>
                      <button
                        className="cc-order-review-btn"
                        onClick={() => alert('Rating & review feature coming soon! Thank you for shopping with CraftConnect.')}
                      >
                        ⭐ Rate
                      </button>
                      <button
                        className="cc-order-invoice-btn"
                        onClick={() => openInvoice(order)}
                      >
                        🧾 Invoice
                      </button>
                    </div>
                  </div>

                  {/* Tracking stepper */}
                  <div className="cc-tracking-stepper">
                    {STATUS_STEPS.map((s, i) => (
                      <div key={s} className={`cc-track-step ${i <= step ? 'done' : ''} ${i === step ? 'current' : ''}`}>
                        <div className="cc-track-dot">{i < step ? '✓' : i + 1}</div>
                        <span className="cc-track-label">{s}</span>
                      </div>
                    ))}
                    <div className="cc-track-progress-bar">
                      <div className="cc-track-progress-fill" style={{ width: `${(step / (STATUS_STEPS.length - 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}