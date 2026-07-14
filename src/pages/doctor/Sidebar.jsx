import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ handleLogout, activeTab, setActiveTab }) => {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-icon"> ✚ </span>
        <span className="logo-text">Medi<span className="text-primary">Pro</span></span>
      </div>
      
      <nav className="nav-menu">
        <Link to="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <span className="icon"> 📊 </span> Tổng quan
        </Link>
        
        <Link to="#" className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
          <span className="icon"> 📅 </span> Lịch hẹn
        </Link>

        <Link to="#" className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
          <span className="icon"> 👤 </span> Bệnh nhân
        </Link>

        <Link to="#" className="nav-item">
          <span className="icon"> 📈 </span> Thống kê
        </Link>
      </nav>

      <div className="sidebar-footer">
        <a href="/" className="nav-item logout" onClick={handleLogout}>
          <span className="icon"> 🚪 </span> Đăng xuất
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;