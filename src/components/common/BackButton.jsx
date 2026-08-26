import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

export default function BackButton({ fallbackPath = '/', label = 'Back' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button className="cc-back-btn" onClick={handleBack} title="Go back to previous page">
      <span className="back-arrow">←</span>
      <span className="back-text">{label}</span>
    </button>
  );
}
