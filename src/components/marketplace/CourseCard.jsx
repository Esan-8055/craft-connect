import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CourseCard.css';

export default function CourseCard({ course }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState(false);

  const title    = course.title;
  const instructor = course.artisan_detail
    ? `${course.artisan_detail.first_name} ${course.artisan_detail.last_name}`.trim()
    : course.instructor || 'Master Artisan';
  const price    = Number(course.monthly_price || course.price || 999);
  const mrp      = course.mrp || Math.round(price * 1.4);
  const discount = Math.round((1 - price / mrp) * 100);
  const thumbnail = course.thumbnail || '';
  const lessons   = course.total_videos || course.lessonsCount || 12;
  const rating    = course.rating || 4.7;
  const students  = course.enrolled || course.students || Math.floor(Math.random() * 3000 + 200);
  const fallback  = 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600';

  const fmtPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleClick = () => {
    navigate(`/course/${course.id}`);
  };

  const onEnroll = (e) => {
    e.stopPropagation();
    addToCart({ ...course, price, name: title, instructor, lessonsCount: lessons });
    setEnrolled(true);
    setTimeout(() => setEnrolled(false), 2200);
  };

  return (
    <article className="cc-course-card" onClick={handleClick}>
      {/* Thumbnail */}
      <div className="cc-course-thumb">
        <img src={thumbnail || fallback} alt={title} loading="lazy" decoding="async" onError={e => { e.target.src = fallback; }} />
        <div className="cc-course-play-btn">▶</div>
        {discount > 0 && (
          <span className="cc-course-disc-badge" style={{ background: '#C8440A' }}>-{discount}% OFF</span>
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
          <span className="cc-course-price">{fmtPrice(price)}</span>
          {mrp > price && <span className="cc-course-mrp" style={{ textDecoration: 'line-through' }}>{fmtPrice(mrp)}</span>}
        </div>

        <button className={`cc-course-enroll-btn ${enrolled ? 'enrolled' : ''}`} onClick={onEnroll}>
          {enrolled ? '✓ Added to Cart' : `Enroll Now — ${fmtPrice(price)}`}
        </button>
      </div>
    </article>
  );
}