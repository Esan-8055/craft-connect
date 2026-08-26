import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CourseCard from '../../components/marketplace/CourseCard';
import Footer from '../../components/common/Footer';
import BackButton from '../../components/common/BackButton';
import { getPublishedCourses } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PremiumModal from '../../components/common/PremiumModal';
import './Courses.css';

const CATS = ['All', 'Textiles', 'Pottery', 'Woodwork', 'Paintings', 'Bamboo', 'Jewelry'];
const MOCK_COURSES = [
  { id: 1, title: 'Handloom Weaving Masterclass', instructor: 'Meena Kumari', category: 'Textiles', monthly_price: 1499, mrp: 2499, rating: 4.9, enrolled: 1240, total_videos: 18, thumbnail: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600' },
  { id: 2, title: 'Blue Pottery Art from Scratch',  instructor: 'Ravi Gupta',   category: 'Pottery',  monthly_price: 999,  mrp: 1800, rating: 4.7, enrolled: 870,  total_videos: 14, thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  { id: 3, title: 'Madhubani Painting Traditions',  instructor: 'Priya Sharma', category: 'Paintings',monthly_price: 1299, mrp: 2000, rating: 4.8, enrolled: 560,  total_videos: 16, thumbnail: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600' },
  { id: 4, title: 'Wood Carving — Advanced Craft',  instructor: 'Mohan Das',    category: 'Woodwork', monthly_price: 1799, mrp: 2800, rating: 4.6, enrolled: 340,  total_videos: 20, thumbnail: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600' },
  { id: 5, title: 'Bamboo Craft & Cane Weaving',    instructor: 'Arjun Nath',   category: 'Bamboo',   monthly_price: 699,  mrp: 1200, rating: 4.5, enrolled: 210,  total_videos: 10, thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600' },
  { id: 6, title: 'Silver Jewelry Making Basics',   instructor: 'Kavita Singh', category: 'Jewelry',  monthly_price: 1399, mrp: 2200, rating: 4.7, enrolled: 680,  total_videos: 15, thumbnail: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600' },
];

const normalizeCat = (catStr) => {
  if (!catStr) return '';
  const s = typeof catStr === 'object' ? (catStr.name || catStr.title || '') : String(catStr);
  const lower = s.toLowerCase().trim();
  if (lower.includes('textile') || lower.includes('weaving')) return 'textiles';
  if (lower.includes('pottery') || lower.includes('clay')) return 'pottery';
  if (lower.includes('wood')) return 'woodwork';
  if (lower.includes('jewel')) return 'jewelry';
  if (lower.includes('paint') || lower.includes('art')) return 'paintings';
  if (lower.includes('bamboo') || lower.includes('cane')) return 'bamboo';
  return lower;
};

export default function Courses() {
  const location = useLocation();
  const { isPremium } = useAuth();
  const initialCat = new URLSearchParams(location.search).get('cat') || 'All';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState(initialCat);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  useEffect(() => {
    const urlCat = new URLSearchParams(location.search).get('cat') || 'All';
    setCat(urlCat);
  }, [location.search]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPublishedCourses();
        const backendItems = Array.isArray(data) ? data : (data?.results || []);
        const combined = [...backendItems, ...MOCK_COURSES.filter(m => !backendItems.some(b => b.id === m.id))];
        setCourses(combined);
      } catch {
        setCourses(MOCK_COURSES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = cat === 'All' 
    ? courses 
    : courses.filter(c => {
        const targetNorm = normalizeCat(cat);
        const cNorm = normalizeCat(c.category);
        return cNorm === targetNorm || (c.category || '').toLowerCase() === cat.toLowerCase();
      });

  return (
    <div className="cc-courses-page">
      <div className="cc-nav-spacer" />

      <div className="cc-container" style={{ paddingTop: 16 }}>
        <BackButton fallbackPath="/" />
      </div>

      {/* Hero */}
      <div className="cc-courses-hero">
        <div className="cc-container">
          <span className="cc-courses-eyebrow">The Artisan Academy</span>
          <h1 className="cc-courses-hero-title">Learn Traditional <em>Indian</em> Crafts</h1>
          <p className="cc-courses-hero-desc">Study directly under national award-winning artisans. Masterclasses reserved exclusively for Premium VIP Members.</p>
          <div className="cc-courses-hero-stats">
            <span>📚 80+ Courses</span>
            <span>👩‍🎨 50+ Master Artisans</span>
            <span>👥 12,000+ Students</span>
            <span>🏆 Certificate on Completion</span>
          </div>
        </div>
      </div>

      {/* Premium Customer Benefits Card */}
      <div className="cc-container">
        <div className="cc-premium-banner-card">
          <div className="pbc-left">
            <span className="pbc-badge">👑 CraftConnect Premium VIP</span>
            <h3>Exclusive Premium Customer Benefits</h3>
            <p>
              {isPremium 
                ? '✨ You have VIP Access! All 80+ Masterclasses, Exclusive Craft Discounts, & Free Delivery are unlocked.' 
                : '🔒 Academy Masterclasses & Special Offers are exclusive to Premium VIP Customers. Unlock unlimited access today for ₹499/year!'}
            </p>
          </div>
          <button className="pbc-btn" onClick={() => setIsPremiumModalOpen(true)}>
            {isPremium ? '✨ View VIP Benefits' : '👑 Unlock Premium Access Pass →'}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="cc-container">
        <div className="cc-courses-filter-row">
          {CATS.map(c => (
            <button key={c} className={`cc-cat-chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        {/* Count */}
        <div className="cc-courses-count">
          {loading ? 'Loading...' : <><strong>{filtered.length}</strong> masterclasses available</>}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="cc-page-loader"><div className="cc-spinner" /><p>Loading academy courses...</p></div>
        ) : filtered.length === 0 ? (
          <div className="cc-empty-state">
            <div className="cc-empty-icon">🎓</div>
            <h3>No courses in this category yet</h3>
            <p>Check back soon — new masterclasses are added weekly</p>
          </div>
        ) : (
          <div className="cc-courses-grid">
            {filtered.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </div>

      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)} 
      />

      <Footer />
    </div>
  );
}