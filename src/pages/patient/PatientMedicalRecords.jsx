import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserAPI } from '../../services/authService';
import { searchDoctorsAPI, getAllDoctorsAPI } from '../../services/adminService';
import { getAllDepartmentsAPI } from '../../services/departmentService';
import { getAllDrugsAPI, getDrugDetailsAPI } from '../../services/drugService';
import { getMedicalHistoryByPatientAPI, getMedicalRecordDetailsAPI, getPrescriptionsByRecordAPI } from '../../services/medicalRecordService';
import '../../style/base.css';
import '../../style/patient.css';
import Sidebar from './Sidebar';
import Header from './Header';

const PatientMedicalRecords = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [apiError, setApiError] = useState(false);
  const dropdownRef = useRef(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDrugModalOpen, setIsDrugModalOpen] = useState(false);
  const [drugs, setDrugs] = useState([]);
  const [drugDetails, setDrugDetails] = useState(null);
  const [isDrugDetailModalOpen, setIsDrugDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getCurrentUserAPI();
        setUser(response.data?.data || response.data);
      } catch (error) {
        console.error('Lỗi lấy thông tin:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      const myId = user?.id || user?.userId;
      if (!myId) return;

      setIsLoading(true);
      try {
        const response = await getMedicalHistoryByPatientAPI(myId);
        const records = response.data?.data || response.data || [];
        setHistoryRecords(Array.isArray(records) ? records : []);
      } catch (error) {
        console.error('Không thể tải bệnh án:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalHistory();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim() !== '') {
        setIsSearching(true);
        setShowDropdown(true);
        setApiError(false);
        try {
          const response = await searchDoctorsAPI(searchTerm);
          setSearchResults(Array.isArray(response.data?.data?.doctors || response.data?.data?.doctorList || response.data?.data?.content || response.data?.data)
            ? (response.data?.data?.doctors || response.data?.data?.doctorList || response.data?.data?.content || response.data?.data)
            : []);
        } catch (error) {
          setSearchResults([]);
          setApiError(true);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const responseDrug = await getAllDrugsAPI(0, 100);
        setDrugs(Array.isArray(responseDrug.data?.data?.content || responseDrug.data?.data) ? (responseDrug.data?.data?.content || responseDrug.data?.data) : []);
      } catch (error) {
        console.error('Lỗi tải thuốc:', error);
      }
    };

    fetchDrugs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    alert('Đăng xuất khỏi MediPro. Hẹn gặp lại bạn!');
    navigate('/login');
  };

  const handleViewRecordDetails = async (recordId) => {
    try {
      const [recordRes, prescriptionRes] = await Promise.all([
        getMedicalRecordDetailsAPI(recordId),
        getPrescriptionsByRecordAPI(recordId).catch(() => ({ data: { data: [] } }))
      ]);
      const recordData = recordRes.data?.data || recordRes.data;
      const prescriptionData = prescriptionRes.data?.data || prescriptionRes.data || [];
      setSelectedRecord({ ...recordData, prescriptionDetails: prescriptionData });
    } catch (error) {
      alert('Không thể xem chi tiết bệnh án lúc này!');
    }
  };

  const handleViewDrugDetails = async (id) => {
    try {
      const response = await getDrugDetailsAPI(id);
      setDrugDetails(response.data?.data || response.data);
      setIsDrugDetailModalOpen(true);
    } catch (error) {
      alert('Lỗi khi tải chi tiết thuốc!');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar handleLogout={handleLogout} setIsDrugModalOpen={setIsDrugModalOpen} />
      <main className="main-content">
        <Header
          dropdownRef={dropdownRef}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          isSearching={isSearching}
          apiError={apiError}
          searchResults={searchResults}
          user={user}
        />
        <div className="page-content">
          <h1 className="page-title">Hồ sơ bệnh án</h1>
          <p className="page-subtitle">Xem lịch sử bệnh án, chẩn đoán và đơn thuốc của bạn.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <section style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' }}>
              <h3 style={{ marginTop: 0, color: '#0f172a' }}>📜 Lịch sử bệnh án</h3>
              {isLoading ? (
                <p style={{ color: '#64748b' }}>Đang tải dữ liệu...</p>
              ) : historyRecords.length > 0 ? (
                historyRecords.map((record) => (
                  <div key={record.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '10px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#2563eb' }}>Bệnh án #{record.id}</strong>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>{record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ'}</span>
                    </div>
                    <p style={{ margin: '4px 0', color: '#334155' }}><strong>Chẩn đoán:</strong> {record.diagnosis}</p>
                    <p style={{ margin: '4px 0', color: '#334155' }}><strong>Điều trị:</strong> {record.treatmentPlan || 'Không có ghi chú'}</p>
                    <button onClick={() => handleViewRecordDetails(record.id)} style={{ marginTop: '6px', padding: '8px 12px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                      Xem chi tiết
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b' }}>Bạn chưa có bệnh án nào.</p>
              )}
            </section>

            <section style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' }}>
              <h3 style={{ marginTop: 0, color: '#0f172a' }}>🩺 Chi tiết bệnh án</h3>
              {selectedRecord ? (
                <div>
                  <p><strong>Mã bệnh án:</strong> #{selectedRecord.id}</p>
                  <p><strong>Chẩn đoán:</strong> {selectedRecord.diagnosis}</p>
                  <p><strong>Kế hoạch điều trị:</strong> {selectedRecord.treatmentPlan || 'Không có ghi chú'}</p>
                  <p><strong>Ngày tái khám:</strong> {selectedRecord.reexaminationDate || 'Không có hẹn'}</p>
                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ marginBottom: '8px' }}>💊 Đơn thuốc</h4>
                    {selectedRecord.prescriptionDetails && selectedRecord.prescriptionDetails.length > 0 ? (
                      <ul>
                        {selectedRecord.prescriptionDetails.map((med, idx) => (
                          <li key={idx} style={{ marginBottom: '8px' }}>
                            <strong>{med.medicineName}</strong> - {med.quantity} {med.unit} <br />
                            <span style={{ color: '#64748b', fontSize: '13px' }}>{med.dosage}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#64748b' }}>Không có đơn thuốc đi kèm.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>Chọn một bệnh án để xem chi tiết.</p>
              )}
            </section>
          </div>
        </div>
      </main>

      {isDrugModalOpen && (
        <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 12000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>💊 Bảng giá thuốc niêm yết</h3>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {drugs.length > 0 ? drugs.map(d => (
                <div key={d.id} style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#0f172a', fontSize: '16px' }}>{d.name}</strong> - <span style={{ color: '#0f6eff', fontWeight: 'bold' }}>{d.price?.toLocaleString()}đ</span>
                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' }}>Thành phần/HDSD: {d.ingredient || d.usageInstruction || 'Đang cập nhật'}</p>
                  </div>
                  <button onClick={() => handleViewDrugDetails(d.id)} style={{ padding: '6px 12px', backgroundColor: '#0f6eff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Chi tiết</button>
                </div>
              )) : (
                <p>Chưa có dữ liệu thuốc!</p>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsDrugModalOpen(false)} style={{ padding: '8px 20px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Đóng lại</button>
            </div>
          </div>
        </div>
      )}

      {isDrugDetailModalOpen && drugDetails && (
        <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 13000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '350px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>💊 Thông tin chi tiết thuốc</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px', color: '#334155', textAlign: 'left' }}>
              <p style={{ margin: 0 }}><strong>Tên thuốc:</strong> <span style={{ color: '#0f6eff', fontWeight: 'bold' }}>{drugDetails.name}</span></p>
              <p style={{ margin: 0 }}><strong>Đơn vị tính:</strong> {drugDetails.unit || 'Chưa cập nhật'}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={() => setIsDrugDetailModalOpen(false)} style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Đóng lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientMedicalRecords;
