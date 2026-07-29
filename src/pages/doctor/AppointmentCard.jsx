import React from 'react';

const AppointmentCard = ({ 
  isLoadingAppointments, 
  appointments, 
  handleViewAppointmentDetails, 
  handleConfirmAppointment, 
  handleCancelAppointment 
}) => {
  return (
    <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)', overflow: 'hidden' }}>
      
      {/* CARD TOOLBAR HEADER */}
      <div className="doctor-card-toolbar">
        <h2 className="doctor-card-title">
          <span>📅</span> Lịch Hẹn Sắp Tới
        </h2>
      </div>

      {/* TABLE CONTENT */}
      <div className="doctor-table-container">
        {isLoadingAppointments ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: 0, fontWeight: '600' }}>⏳ Đang tải dữ liệu lịch hẹn...</p>
          </div>
        ) : appointments.length > 0 ? (
          <table className="doctor-table">
            <thead>
              <tr>
                <th style={{ width: '6%', textAlign: 'center' }}>#</th>
                <th style={{ width: '32%' }}>Bệnh nhân</th>
                <th style={{ width: '16%' }}>Ngày khám</th>
                <th style={{ width: '12%' }}>Giờ hẹn</th>
                <th style={{ width: '22%' }}>Triệu chứng / Lý do</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ width: '20%', textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt, index) => (
                <tr key={appt.id || index}>
                  <td style={{ textAlign: 'center', color: '#64748b', fontWeight: '600' }}>#{appt.id}</td>
                  <td>
                    <div className="doctor-patient-pill">
                      <img 
                        src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${appt.patientId || index}`} 
                        alt="Patient Avatar"
                        className="doctor-patient-avatar" 
                      />
                      <div>
                        <div className="doctor-patient-name">{appt.patientName || `Bệnh nhân #${appt.patientId}`}</div>
                        <div className="doctor-patient-sub">Mã hồ sơ: P-{1000 + (appt.patientId || index)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#0f172a', fontWeight: '600' }}>{appt.appointmentDate}</td>
                  <td>
                    <span style={{ padding: '4px 10px', background: '#f1f5f9', color: '#0f6eff', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem' }}>
                      ⏰ {appt.startTime}
                    </span>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.875rem' }}>
                    {appt.symptoms || appt.reason || appt.description || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Không có ghi chú</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`doctor-badge ${appt.status === 'PENDING' ? 'pending' : appt.status === 'CANCELLED' ? 'cancelled' : 'confirmed'}`}>
                      {appt.status === 'PENDING' ? '⏳ Chờ duyệt' : appt.status === 'CANCELLED' ? '❌ Đã hủy' : '✅ Đã xác nhận'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleViewAppointmentDetails(appt.id)}
                        className="doctor-btn doctor-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        👁️ Chi tiết
                      </button>

                      {appt.status === 'PENDING' && (
                        <button 
                          onClick={() => handleConfirmAppointment(appt.id)}
                          className="doctor-btn doctor-btn-success"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          ✓ Duyệt
                        </button>
                      )}

                      {appt.status !== 'CANCELLED' && (
                        <button 
                          onClick={() => handleCancelAppointment(appt.id)}
                          className="doctor-btn doctor-btn-danger"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          ✕ Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Hôm nay bác sĩ chưa có lịch hẹn nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;