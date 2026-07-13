import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AppointmentSection = ({ setIsModalOpen, isLoadingAppointments, appointments, handleViewAppointmentDetails, handleCancelAppointment, handlePatientDeleteAppointment, handleViewMedicalRecord, handleViewOwnHistory }) => {
  const [searchRecordId, setSearchRecordId] = useState('');

  return (
    <div className="appointments-section">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <h2>Lịch hẹn của bạn</h2>
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Đặt lịch khám</button>
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" onClick={() => handleViewAppointmentDetails(appt.id)} style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px' }}>Chi tiết</button>
                {appt.status !== 'CANCELLED' && (
                  <button className="btn-cancel" onClick={() => handleCancelAppointment(appt.id)}>Hủy lịch</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            <p>Bạn chưa có lịch hẹn nào. Hãy ấn <strong>+ Đặt lịch nhanh</strong> để bắt đầu!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentSection;