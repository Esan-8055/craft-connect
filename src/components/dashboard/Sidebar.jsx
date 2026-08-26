import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="terracotta-sidebar">
      <div className="sidebar-brand">
        <h2>Artisan <i>Studio</i></h2>
      </div>
      
      <nav className="sidebar-menu">
        <NavLink to="/seller" end className={({ isActive }) => isActive ? "s-link active" : "s-link"}>
          <span className="s-icon">📊</span> Dashboard
        </NavLink>

        <NavLink to="/seller/orders" className={({ isActive }) => isActive ? "s-link active" : "s-link"}>
          <span className="s-icon">📦</span> Orders Received
        </NavLink>
        
        <NavLink to="/seller/products" className={({ isActive }) => isActive ? "s-link active" : "s-link"}>
          <span className="s-icon">🏺</span> My Products
        </NavLink>
        
        <NavLink to="/seller/add-product" className={({ isActive }) => isActive ? "s-link active" : "s-link"}>
          <span className="s-icon">✨</span> Upload Product
        </NavLink>
        
        <NavLink to="/seller/courses" className={({ isActive }) => isActive ? "s-link active" : "s-link"}>
          <span className="s-icon">🎓</span> My Courses
        </NavLink>

        <NavLink to="/seller/add-course" className={({ isActive }) => isActive ? "s-link active" : "s-link"}>
          <span className="s-icon">📝</span> Create Course
        </NavLink>
        
        <NavLink to="/seller/settings" className={({ isActive }) => isActive ? "s-link active" : "s-link"}>
          <span className="s-icon">⚙️</span> Studio Settings
        </NavLink>

        <NavLink to="/seller/earnings" className={({ isActive }) => isActive ? "s-link active" : "s-link"}>
          <span className="s-icon">💰</span> My Earnings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>Verified Artisan Studio</p>
      </div>
    </div>
  );
};

export default Sidebar;