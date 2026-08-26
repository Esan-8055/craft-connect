import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import './Classroom.css';

const Classroom = () => {
  // 1. Hardcoded Course Data
  const courseContent = {
    title: "Pottery Basics: Wheel Throwing",
    instructor: "Ramesh Kumbhar",
    chapters: [
      { id: 1, title: "Introduction to Clay Types", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      { id: 2, title: "Preparing the Wheel", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      { id: 3, title: "Centering the Clay", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      { id: 4, title: "Pulling the Walls", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      { id: 5, title: "Final Shaping and Trimming", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
    ]
  };

  // 2. State to track current lesson
  const [currentLesson, setCurrentLesson] = useState(courseContent.chapters[0]);
  const [completedLessons, setCompletedLessons] = useState([]);

  const toggleComplete = (id) => {
    if (completedLessons.includes(id)) {
      setCompletedLessons(completedLessons.filter(item => item !== id));
    } else {
      setCompletedLessons([...completedLessons, id]);
    }
  };

  return (
    <>
      <div className="cc-nav-spacer" />
      <div className="cc-container" style={{ paddingTop: 16 }}>
        <BackButton fallbackPath="/my-learning" />
      </div>
      <div className="classroom-container">
        {/* Main Player Area */}
        <main className="video-section">
          <div className="video-wrapper">
            <video 
              key={currentLesson.id} 
              controls 
              autoPlay 
              className="main-video"
            >
              <source src={currentLesson.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="video-info">
            <div className="info-header">
              <h2>{currentLesson.title}</h2>
              <button 
                className={`complete-btn ${completedLessons.includes(currentLesson.id) ? 'is-complete' : ''}`}
                onClick={() => toggleComplete(currentLesson.id)}
              >
                {completedLessons.includes(currentLesson.id) ? '✓ Completed' : 'Mark as Complete'}
              </button>
            </div>
            <p className="course-breadcrumb">
              <Link to="/courses">Courses</Link> / {courseContent.title}
            </p>
            <hr />
            <div className="lesson-description">
              <h3>About this lesson</h3>
              <p>In this module, {courseContent.instructor} demonstrates the core techniques required for this stage of the craft. Follow along closely and practice the hand movements shown in the video.</p>
            </div>
          </div>
        </main>

      {/* Sidebar Curriculum */}
      <aside className="curriculum-sidebar">
        <div className="sidebar-header">
          <h3>Course Content</h3>
          <p>{courseContent.chapters.length} Lessons</p>
        </div>
        <div className="chapter-list">
          {courseContent.chapters.map((chapter, index) => (
            <div 
              key={chapter.id} 
              className={`chapter-item ${currentLesson.id === chapter.id ? 'active' : ''}`}
              onClick={() => setCurrentLesson(chapter)}
            >
              <div className="chapter-index">{index + 1}</div>
              <div className="chapter-info">
                <p className="chapter-title">{chapter.title}</p>
                <span className="chapter-duration">10:00</span>
              </div>
              {completedLessons.includes(chapter.id) && <span className="check-icon">✓</span>}
            </div>
          ))}
        </div>
      </aside>
    </div>
    </>
  );
};

export default Classroom;