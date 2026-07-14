import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AppointmentCard = ({ isLoadingAppointments, appointments, setIsModalOpen, openRecordModal, handleViewAppointmentDetails, handleConfirmAppointment, handleCancelAppointment, handleViewMedicalRecord, handleViewPatientHistory }) => {
  const [searchRecordId, setSearchRecordId] = useState('');
  // 🚀 STATE TRA CỨU SỔ KHÁM THEO MÃ BỆNH NHÂN
  const [patientHistoryId, setPatientHistoryId] = useState('');

  return (
    <div className="card appointment-card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <h2 className="card-title">Lịch hẹn sắp tới</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            {/* Tra cứu sổ khám bệnh cũ theo ID bệnh nhân */}
            <input type="number" placeholder="Mã ID Bệnh nhân..." value={patientHistoryId} onChange={e => setPatientHistoryId(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #60a5fa', width: '130px', fontSize: '13px' }} />
            <button onClick={() => handleViewPatientHistory(patientHistoryId)} style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Xem Sổ Khám</button>

            {/* Tra cứu bệnh án lẻ */}
            <input type="number" placeholder="ID Bệnh án..." value={searchRecordId} onChange={e => setSearchRecordId(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100px', fontSize: '13px' }} />
            <button onClick={() => handleViewMedicalRecord(searchRecordId)} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Tra cứu BA</button>
            
            <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '6px 12px', fontSize: '13px' }}>+ Thêm lịch</button>
        </div>
      </div>
      <div className="appointment-list" style={{ padding: '0 4px' }}>
        {isLoadingAppointments ? (
          <p style={{padding: '20px', textAlign: 'center', color: '#64748b'}}>Đang tải dữ liệu lịch hẹn...</p>
        ) : appointments.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', width: '5%' }}>#</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', width: '30%' }}>Bệnh nhân</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', width: '15%' }}>Ngày khám</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', width: '12%' }}>Giờ</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', width: '20%' }}>Triệu chứng</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600', width: '12%' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600', width: '20%' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt, index) => (
                <tr key={appt.id || index}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>#{appt.id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${appt.patientId || index}`} alt="Patient"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '15px', color: '#0f172a' }}>{appt.patientName || `BN #${appt.patientId}`}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#334155', fontSize: '14px' }}>{appt.appointmentDate}</td>
                  <td style={{ padding: '14px 16px', color: '#334155', fontSize: '14px', fontWeight: '500' }}>{appt.startTime}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>{appt.symptoms || appt.reason || appt.description || <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>Không có ghi chú</span>}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span className={`status-badge ${appt.status === 'PENDING' ? 'pending' : appt.status === 'CANCELLED' ? 'cancelled' : 'confirmed'}`}>
                      {appt.status || 'Chờ khám'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => handleViewAppointmentDetails(appt.id)}
                        style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        Chi tiết
                      </button>
                      {appt.status === 'PENDING' && (
                        <button onClick={() => handleConfirmAppointment(appt.id)}
                          style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          Xác nhận
                        </button>
                      )}
                      {appt.status !== 'CANCELLED' && (
                        <button onClick={() => handleCancelAppointment(appt.id)}
                          style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>📭 Hôm nay bác sĩ chưa có lịch hẹn nào.</div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;