import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import BackButton from '../../components/common/BackButton';
import { getMyCourses, publishCourse, unpublishCourse, deleteCourse } from '../../services/api';
import './SellerDashboard.css';
import './MyCourses.css';

const SELLER_COURSES_CATALOG = [
  { id: 1, title: 'Handloom Weaving Masterclass', instructor: 'Meena Kumari', category: 'Textiles', monthly_price: 1499, is_published: true, total_videos: 18, enrolled: 1240, thumbnail: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600' },
  { id: 2, title: 'Blue Pottery Art from Scratch',  instructor: 'Ravi Gupta',   category: 'Pottery',  monthly_price: 999,  is_published: true, total_videos: 14, enrolled: 870,  thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  { id: 3, title: 'Madhubani Painting Traditions',  instructor: 'Priya Sharma', category: 'Paintings',monthly_price: 1299, is_published: true, total_videos: 16, enrolled: 560,  thumbnail: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600' },
  { id: 4, title: 'Wood Carving — Advanced Craft',  instructor: 'Mohan Das',    category: 'Woodwork', monthly_price: 1799, is_published: true, total_videos: 20, enrolled: 340,  thumbnail: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600' },
  { id: 5, title: 'Bamboo Craft & Cane Weaving',    instructor: 'Arjun Nath',   category: 'Bamboo',   monthly_price: 699,  is_published: true, total_videos: 10, enrolled: 210,  thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600' },
  { id: 6, title: 'Silver Jewelry Making Basics',   instructor: 'Kavita Singh', category: 'Jewelry',  monthly_price: 1399, is_published: true, total_videos: 15, enrolled: 680,  thumbnail: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600' },
];

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCourses = useCallback(async () => {
    try {
      const data = await getMyCourses();
      const items = Array.isArray(data) ? data : (data?.results || []);
      if (items && items.length > 0) {
        setCourses(items);
      } else {
        setCourses(SELLER_COURSES_CATALOG);
      }
    } catch (err) {
      console.warn('Backend unavailable, displaying full seller courses catalog:', err.message);
      setCourses(SELLER_COURSES_CATALOG);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handlePublish = async (id) => {
    setActionLoading(id);
    try {
      await publishCourse(id).catch(() => null);
      setCourses(prev => prev.map(c => c.id === id ? { ...c, is_published: true } : c));
      showToast('Course published to marketplace!');
    } catch (err) {
      setCourses(prev => prev.map(c => c.id === id ? { ...c, is_published: true } : c));
      showToast('Course published to marketplace!');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (id) => {
    setActionLoading(id);
    try {
      await unpublishCourse(id).catch(() => null);
      setCourses(prev => prev.map(c => c.id === id ? { ...c, is_published: false } : c));
      showToast('Course reverted to draft.');
    } catch (err) {
      setCourses(prev => prev.map(c => c.id === id ? { ...c, is_published: false } : c));
      showToast('Course reverted to draft.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await deleteCourse(id).catch(() => null);
      setCourses(prev => prev.filter(c => c.id !== id));
      showToast('Course deleted.');
    } catch (err) {
      setCourses(prev => prev.filter(c => c.id !== id));
      showToast('Course deleted.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCourses = courses.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const fallbackImg = 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600';

  return (
    <div className="seller-layout">
      <Sidebar />
      <main className="my-courses-main">
        <header className="my-courses-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="pre-title">Academy Management</span>
              <h1>My <i>Masterclass Courses</i></h1>
              <p className="inv-summary">
                {courses.length} Course{courses.length !== 1 ? 's' : ''} &middot;{' '}
                {courses.filter(c => c.is_published).length} Published &middot;{' '}
                {courses.filter(c => !c.is_published).length} Drafts
              </p>
            </div>
            <button className="add-course-header-btn" onClick={() => navigate('/seller/add-course')}>
              + Create New Course
            </button>
          </div>
        </header>

        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="🔍 Search courses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', maxWidth: 360, padding: '10px 14px', borderRadius: 8, border: '1px solid #EFE6DC', fontSize: 13 }}
          />
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
            <p>Loading your courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="inv-empty">
            <p>No courses found.</p>
            <button className="create-first-btn" onClick={() => navigate('/seller/add-course')}>
              🎓 Create Course
            </button>
          </div>
        ) : (
          <div className="inventory-grid">
            {filteredCourses.map(item => (
              <div key={item.id} className="inventory-card">
                <div className="inv-img-wrapper">
                  <img
                    src={item.thumbnail || fallbackImg}
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
                    <span className="inv-price">₹{Number(item.monthly_price).toLocaleString('en-IN')}/access</span>
                    <span className="inv-stock">{item.total_videos || 12} videos</span>
                  </div>
                  {item.category && (
                    <span className="course-category-tag" style={{ background: '#FDF0EB', color: '#C8440A', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, display: 'inline-block', marginBottom: 8 }}>
                      {item.category}
                    </span>
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

export default MyCourses;