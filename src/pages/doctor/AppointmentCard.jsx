import React, { useState, useEffect } from 'react';
import Pagination from '../../components/Pagination';

const AppointmentCard = ({ 
  isLoadingAppointments, 
  appointments = [], 
  setIsModalOpen, 
  openRecordModal, 
  handleViewAppointmentDetails, 
  handleConfirmAppointment, 
  handleCancelAppointment,
  handleDeleteAppointment,
  handleViewMedicalRecord, 
  handleViewPatientHistory 
}) => {
  const [searchRecordId, setSearchRecordId] = useState('');
  const [patientHistoryId, setPatientHistoryId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [appointments.length]);

  const totalPages = Math.ceil(appointments.length / itemsPerPage) || 1;
  const validatedCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validatedCurrentPage - 1) * itemsPerPage;
  const currentAppointments = appointments.slice(startIndex, startIndex + itemsPerPage);

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
          <>
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
                {currentAppointments.map((appt, index) => (
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
                      <span className={`doctor-badge ${appt.status === 'PENDING' ? 'pending' : appt.status === 'CANCELLED' ? 'cancelled' : appt.status === 'COMPLETED' ? 'completed' : 'confirmed'}`}>
                        {appt.status === 'PENDING' ? '⏳ Chờ duyệt' : appt.status === 'CANCELLED' ? '❌ Đã hủy' : appt.status === 'COMPLETED' ? '💙 Đã khám' : '✅ Đã xác nhận'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '95px 75px 65px', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                        <div>
                          <button 
                            onClick={() => handleViewAppointmentDetails(appt.id)}
                            className="doctor-btn"
                            style={{ 
                              width: '100%',
                              padding: '7px 8px', 
                              fontSize: '0.825rem', 
                              fontWeight: '600',
                              borderRadius: '8px',
                              background: '#eff6ff',
                              color: '#0f6eff',
                              border: '1px solid #bfdbfe',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              justifyContent: 'center'
                            }}
                          >
                            👁️ Chi tiết
                          </button>
                        </div>

                        <div>
                          {appt.status === 'PENDING' && (
                            <button 
                              onClick={() => handleConfirmAppointment(appt.id)}
                              className="doctor-btn doctor-btn-success"
                              style={{ width: '100%', padding: '7px 8px', fontSize: '0.825rem', borderRadius: '8px', whiteSpace: 'nowrap', justifyContent: 'center' }}
                            >
                              ✓ Duyệt
                            </button>
                          )}
                        </div>

                        <div>
                          {appt.status !== 'CANCELLED' && (
                            <button 
                              onClick={() => handleCancelAppointment(appt.id)}
                              className="doctor-btn doctor-btn-danger"
                              style={{ width: '100%', padding: '7px 8px', fontSize: '0.825rem', borderRadius: '8px', whiteSpace: 'nowrap', justifyContent: 'center' }}
                            >
                              ✕ Hủy
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination 
              currentPage={validatedCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={appointments.length}
              itemsPerPage={itemsPerPage}
            />
          </>
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