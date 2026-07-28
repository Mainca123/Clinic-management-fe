import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserAPI } from '../../services/authService';
import { searchDoctorsAPI } from '../../services/adminService';
import { getAllDrugsAPI, getDrugDetailsAPI } from '../../services/drugService';
import '../../style/base.css';
import '../../style/patient.css';
import Sidebar from './Sidebar';
import Header from './Header';

const PatientDrugPrice = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [apiError, setApiError] = useState(false);
  const dropdownRef = useRef(null);
  const [drugs, setDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrugModalOpen, setIsDrugModalOpen] = useState(false);
  const [drugSearchTerm, setDrugSearchTerm] = useState('');

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
    const fetchDrugs = async () => {
      setIsLoading(true);
      try {
        const responseDrug = await getAllDrugsAPI(0, 100);
        const list = Array.isArray(responseDrug.data?.data?.content || responseDrug.data?.data)
          ? (responseDrug.data?.data?.content || responseDrug.data?.data)
          : [];
        setDrugs(list);
      } catch (error) {
        console.error('Lỗi tải thuốc:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrugs();
  }, []);

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

  const handleViewDrugDetails = async (id, drugItem = null) => {
    if (drugItem) {
      setSelectedDrug(drugItem);
    }
    try {
      const response = await getDrugDetailsAPI(id);
      setSelectedDrug(response.data?.data || response.data || drugItem);
      setIsDrugModalOpen(true);
    } catch (error) {
      if (drugItem) {
        setSelectedDrug(drugItem);
        setIsDrugModalOpen(true);
      } else {
        alert('Không thể xem chi tiết thuốc!');
      }
    }
  };

  const filteredDrugs = drugs.filter((drug) => {
    const keyword = drugSearchTerm.toLowerCase();
    return !keyword || drug.name?.toLowerCase().includes(keyword) || drug.ingredient?.toLowerCase().includes(keyword);
  });

  return (
    <div className="dashboard-container">
      <Sidebar handleLogout={handleLogout} setIsDrugModalOpen={() => {}} />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button onClick={() => navigate('/patient/dashboard')} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ← Quay lại Trang tổng quan
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
            <section style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' }}>
              <h3 style={{ marginTop: 0, color: '#0f172a' }}>💊 Tra cứu giá thuốc</h3>
              <input
                type="text"
                placeholder="Nhập tên thuốc hoặc thành phần..."
                value={drugSearchTerm}
                onChange={(e) => setDrugSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '12px', boxSizing: 'border-box' }}
              />

              {isLoading ? (
                <p style={{ color: '#64748b' }}>Đang tải dữ liệu thuốc...</p>
              ) : filteredDrugs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
                  {filteredDrugs.map((drug) => (
                    <div
                      key={drug.id}
                      onClick={() => handleViewDrugDetails(drug.id, drug)}
                      style={{ border: selectedDrug?.id === drug.id ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', background: selectedDrug?.id === drug.id ? '#eff6ff' : '#f8fafc', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <div>
                          <strong style={{ color: '#2563eb' }}>{drug.name}</strong>
                          <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px' }}>{drug.ingredient || 'Đang cập nhật'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#0f6eff', fontWeight: 'bold' }}>{drug.price?.toLocaleString()}đ</div>
                          <button onClick={(e) => { e.stopPropagation(); handleViewDrugDetails(drug.id, drug); }} style={{ marginTop: '6px', padding: '6px 10px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>Không tìm thấy thuốc phù hợp.</p>
              )}
            </section>

            <section style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' }}>
              <h3 style={{ marginTop: 0, color: '#0f172a' }}>🔎 Chi tiết & Hướng dẫn</h3>
              {selectedDrug ? (
                <div style={{ background: 'linear-gradient(135deg, #eef6ff 0%, #f8fbff 100%)', borderRadius: '12px', padding: '18px', border: '1px solid #dbeafe', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #bfdbfe', paddingBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#1e40af', fontSize: '18px' }}>💊 {selectedDrug.name}</h4>
                    <span style={{ background: '#2563eb', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                      {selectedDrug.price?.toLocaleString()}đ
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#334155' }}><strong>Đơn vị tính:</strong> {selectedDrug.unit || 'Chưa cập nhật'}</p>
                  <p style={{ margin: 0, color: '#334155' }}><strong>Thành phần:</strong> {selectedDrug.ingredient || 'Đang cập nhật'}</p>
                  <p style={{ margin: 0, color: '#334155' }}><strong>Hướng dẫn sử dụng / Liều dùng:</strong></p>
                  <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '14px', lineHeight: '1.5' }}>
                    {selectedDrug.usageInstruction || 'Theo chỉ định của bác sĩ chuyên khoa.'}
                  </div>
                  <button onClick={() => setSelectedDrug(null)} style={{ alignSelf: 'flex-start', marginTop: '6px', padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                    ✕ Bỏ chọn
                  </button>
                </div>
              ) : (
                <div style={{ background: 'linear-gradient(135deg, #eef6ff 0%, #f8fbff 100%)', borderRadius: '12px', padding: '16px', border: '1px solid #dbeafe' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>Nhấp vào một thuốc trong danh sách để xem thông tin chi tiết và hướng dẫn sử dụng.</p>
                  <div style={{ color: '#0f172a', fontSize: '15px', lineHeight: '1.6' }}>
                    <strong>Gợi ý:</strong> Bạn có thể gõ vào ô tìm kiếm theo tên hoặc thành phần thuốc.
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {isDrugModalOpen && selectedDrug && (
        <div onClick={() => setIsDrugModalOpen(false)} style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 13000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '420px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>💊 {selectedDrug.name}</h3>
              <button onClick={() => setIsDrugModalOpen(false)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>✕ Đóng</button>
            </div>
            <p style={{ margin: 0 }}><strong>Giá:</strong> <span style={{ color: '#0f6eff', fontWeight: 'bold' }}>{selectedDrug.price?.toLocaleString()}đ</span></p>
            <p style={{ margin: 0 }}><strong>Đơn vị:</strong> {selectedDrug.unit || 'Chưa cập nhật'}</p>
            <p style={{ margin: 0 }}><strong>Thành phần:</strong> {selectedDrug.ingredient || 'Đang cập nhật'}</p>
            <p style={{ margin: 0 }}><strong>Hướng dẫn sử dụng:</strong> {selectedDrug.usageInstruction || 'Đang cập nhật'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDrugPrice;
