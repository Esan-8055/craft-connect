import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import BackButton from '../../components/common/BackButton';
import { readStoredOrders } from '../../context/CartContext';
import { apiGet } from '../../services/api';
import './SellerDashboard.css';

export default function Earnings() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const backendData = await apiGet('/orders/').catch(() => null);
        const backendOrders = Array.isArray(backendData)
          ? backendData
          : (backendData?.results || []);

        const formattedBackend = backendOrders.map(b => ({
          id:           `ORD-${b.id}`,
          productTitle: b.items?.[0]?.product_detail?.title || 'Handcrafted Item',
          amount:       Number(b.total_amount || 500),
          status:       b.status || 'pending',
          date:         new Date(b.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        }));

        const localOrders = readStoredOrders();
        const combined = [...formattedBackend];
        localOrders.forEach(lo => {
          const normId = String(lo.id).replace('ORD-', '');
          if (!combined.some(c => String(c.id).replace('ORD-', '') === normId)) {
            combined.push({
              id:           lo.id,
              productTitle: lo.productTitle || 'Craft Product',
              amount:       Number(lo.amount || 0),
              status:       lo.status || 'pending',
              date:         lo.date || '',
            });
          }
        });
        setOrders(combined);
      } catch {
        setOrders(readStoredOrders().map(o => ({
          id:           o.id,
          productTitle: o.productTitle || 'Craft Product',
          amount:       Number(o.amount || 0),
          status:       o.status || 'pending',
          date:         o.date || '',
        })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalRevenue   = orders.reduce((s, o) => s + o.amount, 0);
  const delivered      = orders.filter(o => o.status.toLowerCase().includes('deliver'));
  const pending        = orders.filter(o => !o.status.toLowerCase().includes('deliver') && !o.status.toLowerCase().includes('cancel'));
  const platformFee    = Math.round(totalRevenue * 0.05);
  const netEarnings    = totalRevenue - platformFee;

  return (
    <div className="seller-layout">
      <Sidebar />
      <main className="earnings-main">
        <header className="earnings-header">
          <span className="pre-title">Artisan Studio Finance</span>
          <h1>My <i>Earnings</i></h1>
          <p>Revenue summary from your craft sales and course enrollments.</p>
        </header>

        {loading ? (
          <div className="dash-loading">
            <div className="inv-spinner" />
            <p>Loading earnings data...</p>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <section className="seller-stats" style={{ marginBottom: 32 }}>
              <div className="seller-card stat-card">
                <label>Total Revenue</label>
                <h3 style={{ color: '#15803D' }}>₹{totalRevenue.toLocaleString('en-IN')}</h3>
                <span className="sub-label">Gross across {orders.length} orders</span>
              </div>
              <div className="seller-card stat-card">
                <label>Platform Fee (5%)</label>
                <h3 style={{ color: '#C8440A' }}>₹{platformFee.toLocaleString('en-IN')}</h3>
                <span className="sub-label">CraftConnect marketplace commission</span>
              </div>
              <div className="seller-card stat-card">
                <label>Net Earnings</label>
                <h3 style={{ color: '#1d4ed8' }}>₹{netEarnings.toLocaleString('en-IN')}</h3>
                <span className="sub-label">After platform deductions</span>
              </div>
              <div className="seller-card stat-card">
                <label>Order Breakdown</label>
                <h3>{delivered.length} Delivered</h3>
                <span className="sub-label">{pending.length} pending / in transit</span>
              </div>
            </section>

            {/* Orders table */}
            <div className="orders-table-card" style={{ overflowX: 'auto' }}>
              {orders.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <span style={{ fontSize: 44, display: 'block', marginBottom: 12 }}>💰</span>
                  <h3 style={{ fontSize: 18, color: '#1C0F06', marginBottom: 6 }}>No earnings yet</h3>
                  <p style={{ color: '#7A685A', fontSize: 13 }}>When buyers purchase your products, your earnings will appear here.</p>
                </div>
              ) : (
                <table className="orders-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Gross (₹)</th>
                      <th>Platform Fee</th>
                      <th>Net (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const fee = Math.round(order.amount * 0.05);
                      const net = order.amount - fee;
                      return (
                        <tr key={order.id}>
                          <td><span className="order-id-badge">{order.id}</span></td>
                          <td style={{ fontSize: 12, color: '#7A685A' }}>{order.date}</td>
                          <td style={{ maxWidth: 220, fontWeight: 500 }}>{order.productTitle}</td>
                          <td><strong>₹{order.amount.toLocaleString('en-IN')}</strong></td>
                          <td style={{ color: '#C8440A' }}>₹{fee.toLocaleString('en-IN')}</td>
                          <td style={{ color: '#15803D', fontWeight: 700 }}>₹{net.toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`status-pill ${order.status}`} style={{ textTransform: 'capitalize' }}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
