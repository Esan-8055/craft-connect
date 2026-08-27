import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import PaymentModal from '../../components/common/PaymentModal';
import BackButton from '../../components/common/BackButton';
import { courses as mockCourses } from '../../services/mockData';
import { apiGet } from '../../services/api';
import './CoursePage.css';

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, completeCheckout } = useCart();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [activeModule, setActiveModule] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      // 1. Instantly check local seller courses & mock courses (0ms delay)
      const localSeller = JSON.parse(localStorage.getItem('cc_seller_courses') || '[]');
      const foundLocal = localSeller.find(c => String(c.id) === String(id));
      const foundMock = mockCourses.find(c => Number(c.id) === Number(id)) || mockCourses[0];
      const initialCourse = foundLocal || foundMock;

      if (initialCourse) {
        setCourse({
          ...initialCourse,
          price: Number(initialCourse.price || initialCourse.monthly_price || 999),
          description: initialCourse.description || "Master traditional heritage techniques passed down through generations of master artisans.",
          duration: "4.5 Hours • On-demand Video",
          level: "Beginner to Advanced",
          enrolledCount: 340
        });
        setLoading(false);
      } else {
        setLoading(true);
      }

      // 2. Fetch fresh backend details in background
      try {
        const data = await apiGet(`/courses/${id}/`).catch(() => null);
        if (data) {
          setCourse({
            id: data.id,
            title: data.title,
            instructor: data.instructor_name || "Heritage Master",
            price: Number(data.price || data.monthly_price || 999),
            thumbnail: data.cover_image || data.thumbnail || "https://images.unsplash.com/photo-1565191999001-551c187427bb?auto=format&fit=crop&q=80&w=800",
            lessonsCount: data.lessons_count || 12,
            rating: 4.9,
            description: data.description || "Master traditional heritage techniques passed down through generations of master artisans.",
            duration: "4.5 Hours • On-demand Video",
            level: "Beginner to Advanced",
            enrolledCount: 340
          });
          setLoading(false);
        }
      } catch {
        // Retains initialCourse
      }
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = () => {
    if (!course) return;
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsPaymentModalOpen(false);
    await completeCheckout(paymentDetails, [course]);
    navigate('/my-learning');
  };

  if (loading) {
    return (
      <div className="course-page-loader">
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
        <p>Loading masterclass workshop details...</p>
      </div>
    );
  }

  if (!course) return null;

  const curriculum = [
    {
      title: "Module 1: Foundations & Material Selection",
      duration: "45 mins",
      lessons: [
        "1.1 Introduction to Heritage Heritage & Origins",
        "1.2 Selecting Natural Clays, Organic Dyes & Raw Fibers",
        "1.3 Preparing Your Artisan Workspace"
      ]
    },
    {
      title: "Module 2: Core Shaping & Technique Masterclass",
      duration: "1 hr 30 mins",
      lessons: [
        "2.1 Hand Motifs & Geometrical Patterns",
        "2.2 Precision Wheel Centering & Throwing",
        "2.3 Layering Natural Pigments"
      ]
    },
    {
      title: "Module 3: Firing, Curing & Finishing",
      duration: "1 hr 15 mins",
      lessons: [
        "3.1 Traditional Earth Kiln Firing",
        "3.2 Sealing & Weather-Proofing",
        "3.3 Final Polishing Techniques"
      ]
    },
    {
      title: "Module 4: Artisan Branding & Craft Business",
      duration: "1 hr",
      lessons: [
        "4.1 Packaging Handcrafted Goods",
        "4.2 Pricing Heritage Crafts for Global Buyers",
        "4.3 Certificate of Completion"
      ]
    }
  ];

  return (
    <div className="course-detail-wrapper">
      <div className="cc-nav-spacer" />
      {/* Breadcrumb with BackButton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <BackButton fallbackPath="/courses" />
        <nav className="course-breadcrumb" style={{ margin: 0 }}>
          <Link to="/courses">Academy Workshops</Link> / 
          <span className="active">{course.title}</span>
        </nav>
      </div>

      {/* Hero Workshop Banner */}
      <div className="course-hero-grid">
        <div className="course-hero-info">
          <span className="workshop-pill">🎓 Heritage Masterclass Workshop</span>
          <h1 className="course-title">{course.title}</h1>
          <p className="course-subtitle">{course.description}</p>

          <div className="course-stats-row">
            <div className="stat-badge">
              <span className="stat-icon">⭐</span>
              <span><strong>{course.rating}</strong> (120 Ratings)</span>
            </div>
            <div className="stat-badge">
              <span className="stat-icon">📚</span>
              <span><strong>{course.lessonsCount}</strong> Video Modules</span>
            </div>
            <div className="stat-badge">
              <span className="stat-icon">⏱️</span>
              <span>{course.duration}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-icon">👥</span>
              <span>{course.enrolledCount} Artisans Enrolled</span>
            </div>
          </div>

          <div className="instructor-hero-card">
            <div className="instructor-avatar">👨‍🏫</div>
            <div className="instructor-meta">
              <span className="label">Workshop Lead Instructor</span>
              <h4>{course.instructor}</h4>
              <p>National Award Winning Master Craftsperson</p>
            </div>
          </div>
        </div>

        {/* Video Hero Trailer Card */}
        <div className="course-video-card">
          <div className="video-thumbnail-container">
            {isPlayingTrailer ? (
              <div className="video-player-mock">
                <div className="playing-indicator">
                  🎬 Playing Workshop Preview Trailer
                </div>
              </div>
            ) : (
              <>
                <img src={course.thumbnail} alt={course.title} className="video-poster" />
                <button className="play-button" onClick={() => setIsPlayingTrailer(true)}>
                  <span className="play-icon">▶</span>
                </button>
                <span className="trailer-tag">Preview Workshop (2:45)</span>
              </>
            )}
          </div>

          <div className="pricing-card-body">
            <div className="course-price-row">
              <span className="price-tag">₹{course.price.toLocaleString('en-IN')}</span>
              <span className="strike-price">₹{(course.price * 1.5).toLocaleString('en-IN')}</span>
              <span className="discount-badge">33% OFF</span>
            </div>

            <button 
              className="enroll-btn" 
              style={{ background: 'linear-gradient(135deg, #C8440A 0%, #A33303 100%)', color: '#fff' }}
              onClick={handleEnroll}
            >
              💳 Enroll Now — ₹{course.price.toLocaleString('en-IN')}
            </button>

            <ul className="perks-list">
              <li>✓ Lifetime Access to All Video Modules</li>
              <li>✓ Downloadable PDF Craft Manuals</li>
              <li>✓ Verified Certificate of Completion</li>
              <li>✓ Direct Artisan Q&A Support</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Curriculum Accordion Section */}
      <section className="curriculum-section">
        <h2>Workshop <i>Curriculum</i></h2>
        <p className="section-sub">Step-by-step masterclass syllabus from beginner to heritage professional.</p>

        <div className="accordion-stack">
          {curriculum.map((module, idx) => (
            <div 
              key={idx} 
              className={`accordion-item ${activeModule === idx ? 'open' : ''}`}
            >
              <div 
                className="accordion-header"
                onClick={() => setActiveModule(activeModule === idx ? -1 : idx)}
              >
                <div className="module-title-wrap">
                  <span className="module-icon">{activeModule === idx ? '▼' : '▶'}</span>
                  <h3>{module.title}</h3>
                </div>
                <span className="module-duration">{module.duration}</span>
              </div>

              {activeModule === idx && (
                <div className="accordion-body">
                  <ul>
                    {module.lessons.map((lesson, lIdx) => (
                      <li key={lIdx}>
                        <span className="play-mini">▶</span>
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={course.price}
      />
    </div>
  );
};

export default CoursePage;
