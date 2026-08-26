import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import BackButton from '../../components/common/BackButton';
import InvoiceModal from '../../components/common/InvoiceModal';
import { readStoredOrders, writeStoredOrders } from '../../context/CartContext';
import { apiGet, apiPatch } from '../../services/api';
import { socket } from '../../services/socket';
import './SellerOrders.css';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'shipped' | 'delivered'
  const [toast, setToast] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const loadAllOrders = useCallback(async () => {
    try {
      // 1. Read local stored orders (from CartContext)
      const localOrders = readStoredOrders();
      const validLocal  = localOrders.filter(o => o && typeof o === 'object' && o.id);

      // 2. Fetch backend orders if available
      const backendData = await apiGet('/orders/').catch(() => null);
      const backendOrders = Array.isArray(backendData) ? backendData : (backendData?.results || []);

      const formattedBackend = backendOrders.map(b => {
        const rawId = b.id || Math.floor(1000 + Math.random() * 9000);
        return {
          id:              `ORD-${rawId}`,
          customerName:    b.shipping_address ? 'Verified Customer' : 'Craft Buyer',
          email:           'buyer@craftconnect.app',
          phone:           '+91 98765 43210',
          shippingAddress: b.shipping_address || 'Express Delivery, India',
          productTitle:    b.items?.[0]?.product_detail?.title || b.productTitle || 'Handcrafted Item',
          productImage:    b.items?.[0]?.product_detail?.image || b.productImage || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
          quantity:        b.items?.[0]?.quantity || 1,
          amount:          Number(b.total_amount || b.price || 500),
          date:            new Date(b.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          status:          b.status || 'pending',
          trackingNumber:  b.tracking_number || '',
          paymentMethod:   'UPI',
          _real:           true,
        };
      });

      // Merge backend and local orders, deduplicating by order ID
      const combined = [...validLocal];
      formattedBackend.forEach(bOrder => {
        const normB = String(bOrder.id).replace('ORD-', '');
        if (!combined.some(c => String(c.id).replace('ORD-', '') === normB)) {
          combined.push(bOrder);
        }
      });

      setOrders(combined);
    } catch (e) {
      console.warn('[SellerOrders] Error loading orders:', e);
      setOrders(readStoredOrders());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllOrders();

    // Listen to Socket.io status updates from elsewhere
    const handleSocketStatus = (data) => {
      loadAllOrders();
    };
    socket.on('order_status_updated', handleSocketStatus);

    window.addEventListener('cc_orders_updated', loadAllOrders);
    window.addEventListener('storage', loadAllOrders);

    return () => {
      socket.off('order_status_updated', handleSocketStatus);
      window.removeEventListener('cc_orders_updated', loadAllOrders);
      window.removeEventListener('storage', loadAllOrders);
    };
  }, [loadAllOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    let rawTracking = '';

    setOrders(prev => {
      const updated = prev.map(order => {
        if (order && order.id === orderId) {
          rawTracking = order.trackingNumber || (newStatus === 'shipped' ? `EXP-${Math.floor(10000000 + Math.random() * 90000000)}` : '');
          return {
            ...order,
            status: newStatus,
            trackingNumber: rawTracking
          };
        }
        return order;
      });

      try {
        writeStoredOrders(updated);
      } catch (e) {
        console.warn('[SellerOrders] localStorage save error:', e);
      }

      return updated;
    });

    setToast(`Order ${orderId} updated to ${newStatus.toUpperCase()}`);
    setTimeout(() => setToast(''), 3000);

    // Emit Socket.io event for real-time buyer sync
    socket.emit('order_status_updated', { orderId, status: newStatus, trackingNumber: rawTracking });

    // Persist status change to backend if it is a backend order
    const rawId = String(orderId).replace('ORD-', '');
    if (!isNaN(Number(rawId))) {
      try {
        await apiPatch(`/orders/${rawId}/update_status/`, { status: newStatus });
      } catch (e) {
        console.warn('[SellerOrders] Failed to sync status with backend:', e);
      }
    }
  };

  const validOrders = (orders || []).filter(o => o && typeof o === 'object');

  const filteredOrders = validOrders.filter(order => {
    if (activeTab === 'all') return true;
    return (order.status || '').toLowerCase() === activeTab.toLowerCase();
  });

  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const pendingCount = validOrders.filter(o => (o.status || '').toLowerCase() === 'pending').length;
  const shippedCount = validOrders.filter(o => (o.status || '').toLowerCase() === 'shipped').length;
  const deliveredCount = validOrders.filter(o => (o.status || '').toLowerCase() === 'delivered').length;

  return (
    <div className="seller-layout">
      <Sidebar />
      <main className="seller-orders-main">
        {selectedInvoiceOrder && (
          <InvoiceModal
            isOpen={isInvoiceOpen}
            onClose={() => setIsInvoiceOpen(false)}
            order={selectedInvoiceOrder}
          />
        )}
        <div style={{ marginBottom: 16 }}>
          <BackButton fallbackPath="/seller" />
        </div>

        <header className="orders-header">
          <span className="eyebrow">Artisan Studio Portal</span>
          <h1>Orders <i>Received</i></h1>
          <p>Track customer purchases, update shipping details, and manage dispatch status.</p>
        </header>

        {toast && (
          <div style={{
            background: '#27AE60', color: '#FFF', padding: '10px 16px', borderRadius: 8,
            marginBottom: 20, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span>✓</span> {toast}
          </div>
        )}

        {/* Stats Summary */}
        <section className="orders-stats-grid">
          <div className="order-stat-card">
            <span className="stat-label">Total Earnings</span>
            <span className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="stat-sub">Across {orders.length} real {orders.length === 1 ? 'order' : 'orders'}</span>
          </div>
          <div className="order-stat-card">
            <span className="stat-label">Action Required</span>
            <span className="stat-value" style={{ color: '#D97706' }}>{pendingCount} Pending</span>
            <span className="stat-sub" style={{ color: '#D97706' }}>Needs packing & dispatch</span>
          </div>
          <div className="order-stat-card">
            <span className="stat-label">In Transit</span>
            <span className="stat-value" style={{ color: '#0284C7' }}>{shippedCount} Shipped</span>
            <span className="stat-sub" style={{ color: '#0284C7' }}>With courier partner</span>
          </div>
          <div className="order-stat-card">
            <span className="stat-label">Delivered</span>
            <span className="stat-value" style={{ color: '#15803D' }}>{deliveredCount} Fulfilled</span>
            <span className="stat-sub">Completed orders</span>
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="orders-filter-tabs">
          <button
            className={`orders-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Orders <span className="tab-count">{orders.length}</span>
          </button>
          <button
            className={`orders-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Pending Dispatch <span className="tab-count">{pendingCount}</span>
          </button>
          <button
            className={`orders-tab-btn ${activeTab === 'shipped' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipped')}
          >
            🚚 In Transit <span className="tab-count">{shippedCount}</span>
          </button>
          <button
            className={`orders-tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivered')}
          >
            ✅ Delivered <span className="tab-count">{deliveredCount}</span>
          </button>
        </div>

        {/* Orders Table */}
        <div className="orders-table-card" style={{ overflowX: 'auto' }}>
          {loading && orders.length === 0 ? (
            <div className="orders-empty-state" style={{ padding: '60px 0' }}>
              <div className="cc-spinner" style={{ margin: '0 auto 16px' }}></div>
              <p>Loading real orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="orders-empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <span style={{ fontSize: 44, display: 'block', marginBottom: 12 }}>📦</span>
              <h3 style={{ fontSize: 18, color: '#1C0F06', marginBottom: 6 }}>No {activeTab !== 'all' ? activeTab : 'real'} orders found</h3>
              <p style={{ color: '#7A685A', maxWidth: 420, margin: '0 auto', fontSize: 13 }}>
                {orders.length === 0
                  ? 'No real orders have been placed yet. When buyers place orders on the marketplace, they will appear here live!'
                  : `There are currently no orders under the "${activeTab}" filter.`}
              </p>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID & Date</th>
                  <th>Customer Details</th>
                  <th>Craft Item Purchased</th>
                  <th>Total Amount</th>
                  <th>Current Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span className="order-id-badge">{order.id}</span>
                      <div style={{ fontSize: 12, color: '#7A685A', marginTop: 4 }}>{order.date}</div>
                    </td>

                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{order.customerName}</span>
                        <span className="customer-address">{order.phone}</span>
                        <span className="customer-address" style={{ fontSize: 11 }}>{order.shippingAddress}</span>
                      </div>
                    </td>

                    <td>
                      <div className="item-thumb-row">
                        <img src={order.productImage} alt={order.productTitle} className="item-thumb-img" />
                        <div className="item-title-col">
                          <span className="item-title-text">{order.productTitle}</span>
                          <span className="item-qty-text">Qty: {order.quantity}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="order-amount-text">
                        ₹{Number(order.amount).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td>
                      <span className={`status-pill ${
                        (order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') ? 'pending' :
                        order.status === 'shipped' ? 'shipped' :
                        order.status === 'delivered' ? 'delivered' : 'pending'
                      }`}>
                        {(order.status === 'pending') && '⏳ Pending'}
                        {(order.status === 'confirmed') && '✔️ Confirmed'}
                        {(order.status === 'processing') && '⚙️ Processing'}
                        {order.status === 'shipped' && '🚚 Shipped'}
                        {order.status === 'delivered' && '✅ Delivered'}
                        {!['pending','confirmed','processing','shipped','delivered'].includes(order.status) && `📋 ${order.status || 'Pending'}`}
                      </span>
                      {order.trackingNumber && (
                        <div style={{ fontSize: 10, color: '#7A685A', marginTop: 4 }}>
                          Trk: {order.trackingNumber}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <select
                          className="status-select-dropdown"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="processing">⚙️ Processing</option>
                          <option value="confirmed">✔️ Confirmed</option>
                          <option value="shipped">🚚 Shipped</option>
                          <option value="delivered">✅ Delivered</option>
                        </select>
                        <button
                          className="invoice-btn"
                          onClick={() => {
                            setSelectedInvoiceOrder(order);
                            setIsInvoiceOpen(true);
                          }}
                          title="Generate Tax Invoice"
                        >
                          🧾 Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
