import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  return (
    <aside className="sidebar">
      <div>
        <div className="logo">
          <span className="logo-icon"> ✚ </span>
          <span className="logo-text">Medi<span className="text-primary">Pro</span></span>
        </div>
        <nav className="nav-menu">
          {/* ĐÃ TÁCH TAB: Quản lý Bác sĩ */}
          <div className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
            <span className="icon"> 👨‍⚕️ </span> Quản lý tài khoản Bác sĩ
          </div>
          
          {/* ĐÃ TÁCH TAB: Quản lý Bệnh nhân */}
          <div className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
            <span className="icon"> 👥 </span> Quản lý tài khoản Bệnh nhân
          </div>


          <div className={`nav-item ${activeTab === 'specialties' ? 'active' : ''}`} onClick={() => setActiveTab('specialties')}>
            <span className="icon"> 🏥 </span> Phòng ban / Khoa
          </div>
          <div className={`nav-item ${activeTab === 'drugs' ? 'active' : ''}`} onClick={() => setActiveTab('drugs')}>
            <span className="icon"> 💊 </span> Quản lý thuốc
          </div>
        </nav>
      </div>
      <div className="sidebar-footer">
        <div className="nav-item logout" onClick={handleLogout}>
          <span className="icon"> 🚪 </span> Đăng xuất
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;