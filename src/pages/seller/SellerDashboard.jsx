import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import BackButton from '../../components/common/BackButton';
import { useAuth } from '../../context/AuthContext';
import { getMyProducts, getMyCourses } from '../../services/api';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsData, coursesData] = await Promise.all([
          getMyProducts().catch(() => null),
          getMyCourses().catch(() => null),
        ]);

        // Fallback to localStorage if backend is offline
        const localProducts = JSON.parse(localStorage.getItem('cc_seller_products') || '[]');
        const localCourses  = JSON.parse(localStorage.getItem('cc_seller_courses')  || '[]');

        const products = productsData
          ? (productsData.results || productsData)
          : localProducts;
        const courses = coursesData
          ? (coursesData.results || coursesData)
          : localCourses;

        setStats({
          totalProducts:     products.length,
          publishedProducts: products.filter(p => p.is_published).length,
          draftProducts:     products.filter(p => !p.is_published).length,
          totalCourses:      courses.length,
          publishedCourses:  courses.filter(c => c.is_published).length,
          draftCourses:      courses.filter(c => !c.is_published).length,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const displayName = user?.first_name || user?.username || 'Artisan';

  return (
    <div className="seller-layout">
      <Sidebar />
      <main className="seller-main">
        <div style={{ marginBottom: 16 }}>
          <BackButton fallbackPath="/marketplace" />
        </div>
        <header className="seller-header">
          <span className="pre-title">Artisan Management</span>
          <h1>Welcome back, <i>{displayName}</i></h1>
          <p>Here's what's happening with your heritage brand today.</p>
        </header>

        {loading ? (
          <div className="dash-loading">
            <div className="inv-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            <section className="seller-stats">
              <div className="seller-card stat-card">
                <label>Total Products</label>
                <h3>{stats.totalProducts}</h3>
                <span className="sub-label">
                  {stats.publishedProducts} published · {stats.draftProducts} drafts
                </span>
              </div>
              <div className="seller-card stat-card">
                <label>Total Courses</label>
                <h3>{stats.totalCourses}</h3>
                <span className="sub-label">
                  {stats.publishedCourses} published · {stats.draftCourses} drafts
                </span>
              </div>
              <div className="seller-card stat-card">
                <label>Published Items</label>
                <h3>{stats.publishedProducts + stats.publishedCourses}</h3>
                <span className="sub-label">
                  Visible to buyers on marketplace
                </span>
              </div>
            </section>

            <section className="seller-card quick-actions-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions-grid">
                <Link to="/seller/add-product" className="quick-action-card">
                  <span className="qa-icon">✨</span>
                  <span className="qa-label">Add Product</span>
                </Link>
                <Link to="/seller/add-course" className="quick-action-card">
                  <span className="qa-icon">🎓</span>
                  <span className="qa-label">Create Course</span>
                </Link>
                <Link to="/seller/products" className="quick-action-card">
                  <span className="qa-icon">🏺</span>
                  <span className="qa-label">My Products</span>
                </Link>
                <Link to="/seller/courses" className="quick-action-card">
                  <span className="qa-icon">📚</span>
                  <span className="qa-label">My Courses</span>
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;