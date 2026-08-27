import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import BackButton from '../../components/common/BackButton';
import './MyLearning.css';

const MyLearning = () => {
  const { myLearning } = useCart(); // Access real purchased course data

  if (!myLearning || myLearning.length === 0) {
    return (
      <div className="learning-wrapper">
        <div className="cc-nav-spacer" />
        <div className="cc-container" style={{ paddingTop: 16 }}>
          <BackButton fallbackPath="/courses" />
        </div>
        <div className="learning-empty-state">
          <h2 className="learning-title">No <i>Courses</i> Enrolled</h2>
          <p className="learning-subtitle">
            Master traditional arts from certified award-winning masters.
          </p>
          <Link to="/courses" className="explore-btn-prime" style={{ marginTop: '20px', display: 'inline-block' }}>
            Browse Academy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-wrapper">
      <div className="cc-nav-spacer" />
      <div className="cc-container" style={{ paddingTop: 16 }}>
        <BackButton fallbackPath="/courses" />
      </div>
      <header className="learning-hero">
        <h1>My <i>Classroom</i></h1>
        <p>You have {myLearning.length} courses in your library.</p>
      </header>

      <div className="enrolled-grid">
        {myLearning.map((course, idx) => (
          <div key={course.id || idx} className="learning-card">
            <img src={course.thumbnail || course.image} alt={course.title} />
            <div className="learning-card-body">
              <span className="enroll-date">
                Enrolled: {course.enrolledDate || 'Recently'}
              </span>
              <h3>{course.title || course.name}</h3>
              <p>Taught by {course.instructor || course.artisanName}</p>
              
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${course.progress || 0}%` }}
                  ></div>
                </div>
                <span>{course.progress || 0}% Complete</span>
              </div>
              
              <Link to="/classroom" state={{ course }} className="resume-link">
                {course.progress > 0 ? 'Resume Lesson' : 'Start Course'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyLearning;