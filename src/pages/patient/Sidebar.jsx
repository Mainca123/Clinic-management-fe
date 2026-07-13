import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ handleLogout, setIsDrugModalOpen }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-icon"> ✚ </span>
        <span className="logo-text">Medi<span className="text-primary">Pro</span></span>
      </div>
      <nav className="nav-menu">
        <Link to="/patient/dashboard" className={`nav-item ${isActive('/patient/dashboard') ? 'active' : ''}`}>
          <span className="icon"> 📊 </span> Tổng quan
        </Link>
        <Link to="/patient/appointments" className={`nav-item ${isActive('/patient/appointments') ? 'active' : ''}`}>
          <span className="icon"> 🗓️ </span> Lịch khám
        </Link>
        <Link to="/patient/medical-records" className={`nav-item ${isActive('/patient/medical-records') ? 'active' : ''}`}>
          <span className="icon"> 🩺 </span> Bệnh án
        </Link>
        <Link to="/patient/drug-prices" className={`nav-item ${isActive('/patient/drug-prices') ? 'active' : ''}`}>
          <span className="icon"> 💊 </span> Tra cứu giá thuốc
        </Link>
      </nav>
      <div className="sidebar-footer">
        <Link to="/" className="nav-item logout" onClick={handleLogout}>
          <span className="icon"> 🚪 </span> Đăng xuất
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;