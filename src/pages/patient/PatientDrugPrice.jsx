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

  const handleViewDrugDetails = async (id) => {
    try {
      const response = await getDrugDetailsAPI(id);
      setSelectedDrug(response.data?.data || response.data);
      setIsDrugModalOpen(true);
    } catch (error) {
      alert('Không thể xem chi tiết thuốc!');
    }
  };

  const filteredDrugs = drugs.filter((drug) => {
    const keyword = searchTerm.toLowerCase();
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
          <h1 className="page-title">Tra cứu giá thuốc</h1>
          <p className="page-subtitle">Tìm kiếm thông tin thuốc và giá niêm yết nhanh chóng.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>
            <section style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#0f172a' }}>💊 Danh sách thuốc</h3>
                <span style={{ color: '#64748b', fontSize: '13px' }}>{filteredDrugs.length} loại</span>
              </div>

              <input
                type="text"
                placeholder="Tìm thuốc theo tên hoặc thành phần..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '12px', boxSizing: 'border-box' }}
              />

              {isLoading ? (
                <p style={{ color: '#64748b' }}>Đang tải dữ liệu thuốc...</p>
              ) : filteredDrugs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
                  {filteredDrugs.map((drug) => (
                    <div key={drug.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <div>
                          <strong style={{ color: '#2563eb' }}>{drug.name}</strong>
                          <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px' }}>{drug.ingredient || 'Đang cập nhật'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#0f6eff', fontWeight: 'bold' }}>{drug.price?.toLocaleString()}đ</div>
                          <button onClick={() => handleViewDrugDetails(drug.id)} style={{ marginTop: '6px', padding: '6px 10px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
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
              <h3 style={{ marginTop: 0, color: '#0f172a' }}>🔎 Thông tin nhanh</h3>
              <div style={{ background: 'linear-gradient(135deg, #eef6ff 0%, #f8fbff 100%)', borderRadius: '12px', padding: '16px', border: '1px solid #dbeafe' }}>
                <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>Chọn một thuốc để xem thông tin và hướng dùng.</p>
                <div style={{ color: '#0f172a', fontSize: '15px', lineHeight: '1.6' }}>
                  <strong>Gợi ý:</strong> Bạn có thể tra cứu thuốc theo tên hoặc thành phần để xem giá nhanh hơn.
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {isDrugModalOpen && selectedDrug && (
        <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 13000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '420px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>💊 {selectedDrug.name}</h3>
            <p style={{ margin: 0 }}><strong>Giá:</strong> <span style={{ color: '#0f6eff', fontWeight: 'bold' }}>{selectedDrug.price?.toLocaleString()}đ</span></p>
            <p style={{ margin: 0 }}><strong>Đơn vị:</strong> {selectedDrug.unit || 'Chưa cập nhật'}</p>
            <p style={{ margin: 0 }}><strong>Thành phần:</strong> {selectedDrug.ingredient || 'Đang cập nhật'}</p>
            <p style={{ margin: 0 }}><strong>Hướng dẫn sử dụng:</strong> {selectedDrug.usageInstruction || 'Đang cập nhật'}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button onClick={() => setIsDrugModalOpen(false)} style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDrugPrice;
