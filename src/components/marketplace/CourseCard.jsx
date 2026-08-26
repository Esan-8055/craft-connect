import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import PremiumModal from '../common/PremiumModal';
import './CourseCard.css';

export default function CourseCard({ course }) {
  const { addToCart } = useCart();
  const { isPremium } = useAuth();
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const title    = course.title;
  const instructor = course.artisan_detail
    ? `${course.artisan_detail.first_name} ${course.artisan_detail.last_name}`.trim()
    : course.instructor || 'Master Artisan';
  const price    = Number(course.monthly_price || course.price || 0);
  const mrp      = course.mrp || Math.round(price * 1.4);
  const discount = Math.round((1 - price / mrp) * 100);
  const thumbnail = course.thumbnail || '';
  const lessons   = course.total_videos || course.lessonsCount || 12;
  const rating    = course.rating || 4.7;
  const students  = course.enrolled || course.students || Math.floor(Math.random() * 3000 + 200);
  const fallback  = 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600';

  const fmtPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleClick = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
    } else {
      navigate(`/course/${course.id}`);
    }
  };

  const onEnroll = (e) => {
    e.stopPropagation();
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    addToCart({ ...course, price: 0, name: title, instructor, lessonsCount: lessons });
    setEnrolled(true);
    setTimeout(() => setEnrolled(false), 2200);
  };

  return (
    <>
      <article className="cc-course-card" onClick={handleClick}>
        {/* Thumbnail */}
        <div className="cc-course-thumb">
          <img src={thumbnail || fallback} alt={title} onError={e => { e.target.src = fallback; }} />
          <div className="cc-course-play-btn">{isPremium ? '▶' : '🔒'}</div>
          {isPremium ? (
            <span className="cc-course-disc-badge" style={{ background: '#22c55e' }}>✨ VIP Unlocked</span>
          ) : (
            <span className="cc-course-disc-badge" style={{ background: '#D97706' }}>👑 Premium Only</span>
          )}
          <span className="cc-course-duration-badge">⏱ 4–6 Weeks</span>
        </div>

        {/* Body */}
        <div className="cc-course-body">
          <span className="cc-course-category">{course.category || 'Artisan Craft'}</span>
          <h3 className="cc-course-title">{title}</h3>
          <p className="cc-course-instructor">by <span>{instructor}</span></p>

          {/* Meta */}
          <div className="cc-course-meta">
            <span>📚 {lessons} Lessons</span>
            <span>👥 {students.toLocaleString('en-IN')} enrolled</span>
          </div>

          {/* Rating */}
          <div className="cc-course-rating-row">
            <span className="cc-rating-chip"><span className="star">★</span> {rating.toFixed(1)}</span>
            <span className="cc-course-rating-count">({students.toLocaleString('en-IN')} reviews)</span>
          </div>

          {/* Price */}
          <div className="cc-course-price-row">
            {isPremium ? (
              <span className="cc-course-price" style={{ color: '#16a34a' }}>FREE (VIP Member)</span>
            ) : (
              <>
                <span className="cc-course-price">{fmtPrice(price)}</span>
                <span className="cc-course-mrp">Free with VIP</span>
              </>
            )}
          </div>

          <button className={`cc-course-enroll-btn ${enrolled ? 'enrolled' : ''} ${!isPremium ? 'premium-locked' : ''}`} onClick={onEnroll}>
            {isPremium ? (enrolled ? '✓ Unlocked' : '▶ Access Course') : '👑 Unlock with Premium'}
          </button>
        </div>
      </article>

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </>
  );
}