import React from 'react';

const StatCards = ({ appointmentsCount }) => {
  return (
    <div className="doctor-stat-grid">
      <div className="doctor-stat-card blue">
        <div className="doctor-stat-icon">👨‍⚕️</div>
        <div className="doctor-stat-details">
          <div className="doctor-stat-label">Tổng bệnh nhân</div>
          <div className="doctor-stat-value">1,250</div>
          <span className="doctor-stat-badge positive">▲ +12% tháng này</span>
        </div>
      </div>

      <div className="doctor-stat-card teal">
        <div className="doctor-stat-icon">📅</div>
        <div className="doctor-stat-details">
          <div className="doctor-stat-label">Lịch hẹn hôm nay</div>
          <div className="doctor-stat-value">{appointmentsCount}</div>
          <span className="doctor-stat-badge neutral">🟢 Đang hoạt động</span>
        </div>
      </div>

      <div className="doctor-stat-card purple">
        <div className="doctor-stat-icon">🩺</div>
        <div className="doctor-stat-details">
          <div className="doctor-stat-label">Ca đã khám xong</div>
          <div className="doctor-stat-value">8</div>
          <span className="doctor-stat-badge positive">✓ Hoàn tất tốt</span>
        </div>
      </div>

      <div className="doctor-stat-card orange">
        <div className="doctor-stat-icon">💊</div>
        <div className="doctor-stat-details">
          <div className="doctor-stat-label">Đơn thuốc đã kê</div>
          <div className="doctor-stat-value">15</div>
          <span className="doctor-stat-badge neutral">💊 Thuốc niêm yết</span>
        </div>
      </div>
    </div>
  );
};

export default StatCards;