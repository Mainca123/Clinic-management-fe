import React, { useState } from 'react';

const AppointmentSection = ({ setIsModalOpen, isLoadingAppointments, appointments, handleViewAppointmentDetails, handleCancelAppointment, handleViewOwnHistory }) => {
  const [searchRecordId, setSearchRecordId] = useState('');

  const canCancel = (appt) => {
    if (appt.status === 'CANCELLED') return false;
    const apptDate = new Date(appt.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((apptDate - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 1;
  };

  return (
    <div className="appointments-section">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <h2>Lịch hẹn của bạn</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Đặt lịch khám</button>
        </div>
      </div>
      <div className="appointment-list">
        {isLoadingAppointments ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu lịch hẹn...</p>
        ) : appointments.length > 0 ? (
          appointments.map((appt, index) => (
            <div className="appointment-card" key={appt.id || index}>
              <div className="doctor-info">
                <img src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${appt.doctorId || 'DrHa'}&backgroundColor=0f6eff`} className="doctor-avatar" alt="Doctor" />
                <div className="doctor-details">
                  <h4>BS. {appt.doctorName || `Mã BS: ${appt.doctorId}`}</h4>
                  <span className="doctor-specialty">{appt.departmentName || 'Chuyên khoa'}</span>
                </div>
              </div>
              <div className="appointment-meta">
                <span className="appointment-time"> ⏰ {appt.appointmentDate} | {appt.startTime}</span>
                <span className={`status-badge ${appt.status === 'PENDING' ? 'pending' : (appt.status === 'CANCELLED' ? 'cancelled' : 'confirmed')}`}>{appt.status || 'Đang diễn ra'}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => handleViewAppointmentDetails(appt.id)} style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>Chi tiết</button>
                {canCancel(appt) ? (
                  <button className="btn-cancel" onClick={() => handleCancelAppointment(appt.id)}>Hủy lịch</button>
                ) : appt.status !== 'CANCELLED' ? (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Không thể hủy</span>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            <p>Bạn chưa có lịch hẹn nào. Hãy ấn <strong>+ Đặt lịch khám</strong> để bắt đầu!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentSection;