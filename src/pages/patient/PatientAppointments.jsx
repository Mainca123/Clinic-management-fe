import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserAPI } from '../../services/authService';
import { searchDoctorsAPI, getAllDoctorsAPI } from '../../services/adminService';
import { getAllDepartmentsAPI } from '../../services/departmentService';
import { createAppointmentAPI, getAllAppointmentsAPI, getAppointmentDetailsAPI, cancelAppointmentAPI, deleteAppointmentAPI, getAppointmentsByDoctorAndDateAPI } from '../../services/appointmentService';
import { getAllDrugsAPI, getDrugDetailsAPI } from '../../services/drugService';
import { getMedicalRecordDetailsAPI, getMedicalHistoryByPatientAPI, getPrescriptionsByRecordAPI } from '../../services/medicalRecordService';
import '../../style/base.css';
import '../../style/patient.css';
import Sidebar from './Sidebar';
import Header from './Header';
import AppointmentSection from './AppointmentSection';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [apiError, setApiError] = useState(false);
  const dropdownRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isDrugModalOpen, setIsDrugModalOpen] = useState(false);
  const [drugDetails, setDrugDetails] = useState(null);
  const [isDrugDetailModalOpen, setIsDrugDetailModalOpen] = useState(false);

  const [apptDetails, setApptDetails] = useState(null);
  const [isApptDetailModalOpen, setIsApptDetailModalOpen] = useState(false);

  const [recordDetails, setRecordDetails] = useState(null);
  const [isRecordDetailModalOpen, setIsRecordDetailModalOpen] = useState(false);

  const [historyRecords, setHistoryRecords] = useState([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // ===== WIZARD STATE =====
  const [wStep, setWStep] = useState(1);
  const [wDept, setWDept] = useState(null);
  const [wDoctor, setWDoctor] = useState(null);
  const [wDate, setWDate] = useState('');
  const [wTime, setWTime] = useState('');
  const [wSymptoms, setWSymptoms] = useState('');
  const [wBookedSlots, setWBookedSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [wDone, setWDone] = useState(false);

  // Các khung giờ làm việc 7h-17h (Mỗi ca cách nhau 30 phút, nghỉ trưa từ 11:30 - 13:00)
  const ALL_TIME_SLOTS = [
    '07:00','07:30','08:00','08:30','09:00','09:30',
    '10:00','10:30','11:00',
    '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
  ];

  const resetWizard = () => {
    setWStep(1); setWDept(null); setWDoctor(null);
    setWDate(''); setWTime(''); setWSymptoms('');
    setWBookedSlots([]); setWDone(false);
  };

  // Lấy slot đã đặt của bác sĩ theo ngày từ danh sách appointments và API getAppointmentsByDoctorAndDateAPI
  const computeBookedSlots = async (doctorId, date) => {
    if (!doctorId || !date) {
      setWBookedSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    // 1. Lọc local taken slots từ appointments đã có
    const localTaken = appointments
      .filter(a =>
        (String(a.doctorId) === String(doctorId) || String(a.doctor_id) === String(doctorId)) &&
        a.appointmentDate === date &&
        a.status !== 'CANCELLED'
      )
      .map(a => (a.startTime || '').slice(0, 5));

    let apiTaken = [];
    try {
      // 2. Gọi API kiểm tra lịch thực tế của bác sĩ theo ngày đã chọn
      const response = await getAppointmentsByDoctorAndDateAPI(doctorId, date);
      const apptList = Array.isArray(response.data?.data?.content || response.data?.data)
        ? (response.data?.data?.content || response.data?.data)
        : Array.isArray(response.data) ? response.data : [];

      apiTaken = apptList
        .filter(a => a.status !== 'CANCELLED')
        .map(a => {
          const rawTime = a.startTime || a.appointmentTime || a.time || a.start_time || a.shiftTime || a.slot || '';
          return String(rawTime).slice(0, 5);
        })
        .filter(t => Boolean(t));
    } catch (error) {
      console.error('Lỗi khi lấy ca khám của bác sĩ từ API:', error);
    } finally {
      setIsLoadingSlots(false);
    }

    setWBookedSlots(Array.from(new Set([...localTaken, ...apiTaken])));
  };

  useEffect(() => {
    if (wDoctor?.id && wDate) {
      computeBookedSlots(wDoctor.id, wDate);
    }
  }, [wDoctor, wDate, appointments]);

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

  const fetchAppointmentsAndDepartments = async () => {
    setIsLoadingAppointments(true);
    try {
      const responseAppt = await getAllAppointmentsAPI(0, 100);
      let apptList = Array.isArray(responseAppt.data?.data?.content || responseAppt.data?.data)
        ? (responseAppt.data?.data?.content || responseAppt.data?.data)
        : [];
      setAppointments(apptList);

      const responseDept = await getAllDepartmentsAPI(0);
      const actualDeptArray = responseDept.data?.data?.departmentResponseList || responseDept.data?.departmentResponseList || responseDept.data?.data?.departments || responseDept.data?.data?.content || responseDept.data?.data || [];
      setDepartments(Array.isArray(actualDeptArray) ? actualDeptArray : []);

      const responseDrug = await getAllDrugsAPI(0, 100);
      setDrugs(Array.isArray(responseDrug.data?.data?.content || responseDrug.data?.data) ? (responseDrug.data?.data?.content || responseDrug.data?.data) : []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      setDepartments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsAndDepartments();
  }, []);

  // Tải danh sách bác sĩ theo ID khoa khi chọn khoa hoặc mở modal
  useEffect(() => {
    if (!isModalOpen) return;
    const fetchDoctorsForDept = async () => {
      setIsLoadingDoctors(true);
      const deptId = wDept ? wDept.id : null;
      let docs = [];
      try {
        const responseDoc = await getAllDoctorsAPI(0, deptId);
        docs = responseDoc.data?.data?.doctors || responseDoc.data?.data?.doctorList || responseDoc.data?.data?.content || responseDoc.data?.data || responseDoc.data || [];
      } catch (error) {
        console.error('Lỗi tải danh sách bác sĩ:', error);
      }

      if (!Array.isArray(docs)) {
        docs = [];
      }

      setDoctorList(docs);
      setIsLoadingDoctors(false);
    };
    fetchDoctorsForDept();
  }, [wDept, isModalOpen]);

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
      setDrugDetails(response.data?.data || response.data);
      setIsDrugDetailModalOpen(true);
    } catch (error) {
      alert('Lỗi khi tải chi tiết thuốc!');
    }
  };

  const handleViewAppointmentDetails = async (id) => {
    try {
      const response = await getAppointmentDetailsAPI(id);
      setApptDetails(response.data?.data || response.data);
      setIsApptDetailModalOpen(true);
    } catch (error) {
      alert('Không tìm thấy thông tin chi tiết lịch khám!');
    }
  };

  const handleViewMedicalRecord = async (id) => {
    if (!id) return alert('Vui lòng nhập ID Bệnh án!');
    try {
      const [recordRes, prescriptionRes] = await Promise.all([
        getMedicalRecordDetailsAPI(id),
        getPrescriptionsByRecordAPI(id).catch(() => ({ data: { data: [] } }))
      ]);
      const recordData = recordRes.data?.data || recordRes.data;
      const prescriptionData = prescriptionRes.data?.data || prescriptionRes.data || [];

      setRecordDetails({ ...recordData, prescriptionDetails: prescriptionData });
      setIsRecordDetailModalOpen(true);
    } catch (error) {
      alert('Không tìm thấy bệnh án!');
    }
  };

  const handleViewOwnHistory = async () => {
    const myId = user?.id || user?.userId;
    if (!myId) return alert('Hệ thống chưa tải xong dữ liệu tài khoản của bạn, vui lòng đợi giây lát!');
    try {
      const response = await getMedicalHistoryByPatientAPI(myId);
      const records = response.data?.data || response.data || [];
      setHistoryRecords(Array.isArray(records) ? records : []);
      setIsHistoryModalOpen(true);
    } catch (error) {
      alert('Không thể tải sổ khám sức khỏe của bạn lúc này!');
    }
  };

  const handleCreateAppointment = async () => {
    try {
      const symptomValue = wSymptoms || 'Kiểm tra sức khỏe';
      const formattedTime = wTime.length === 5 ? wTime + ':00' : wTime;

      // doctorId = doctors.id (bảng doctors trong DB), KHÔNG phải users.id
      await createAppointmentAPI({
        patientId: user?.id || user?.userId || 0,
        doctorId: parseInt(wDoctor.id),
        appointmentDate: wDate,
        startTime: formattedTime,
        symptoms: symptomValue,
        symptom: symptomValue,
        reason: symptomValue,
        description: symptomValue
      });

      // Ngay sau khi xác nhận đăng ký thành công, đánh dấu ca khám này là Bận (booked)
      setWBookedSlots(prev => Array.from(new Set([...prev, wTime])));
      setWDone(true);
      setWStep(5);

      // Tải lại danh sách đặt lịch và cập nhật danh sách slot bận
      await fetchAppointmentsAndDepartments();
      if (wDoctor?.id && wDate) {
        computeBookedSlots(wDoctor.id, wDate);
      }
    } catch (error) {
      alert('Đặt lịch thất bại. Vui lòng kiểm tra lại thông tin!');
    }
  };

  const handleCancelAppointment = async (id) => {
    const reasonText = window.prompt('Lý do hủy lịch:');
    if (reasonText === null) return;

    try {
      const currentAppt = appointments.find(a => a.id === id);
      const pId = currentAppt ? (currentAppt.patientId || currentAppt.userId) : null;

      await cancelAppointmentAPI(id, pId, reasonText);
      alert('Đã hủy lịch thành công!');
      fetchAppointmentsAndDepartments();
    } catch (error) {
      alert('Lỗi hủy lịch! Vui lòng kiểm tra lại URL API.');
    }
  };

  const handlePatientDeleteAppointment = async (id) => {
    if (window.confirm('🗑️ Bạn muốn xóa vĩnh viễn thẻ lịch hẹn này khỏi danh sách hiển thị không?')) {
      try {
        await deleteAppointmentAPI(id);
        alert('🗑️ Xóa lịch hẹn thành công!');
        fetchAppointmentsAndDepartments();
      } catch (error) {
        alert('Xóa lịch hẹn thất bại. Vui lòng thử lại!');
      }
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
          <div className="patient-dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
            <AppointmentSection
              setIsModalOpen={setIsModalOpen}
              isLoadingAppointments={isLoadingAppointments}
              appointments={appointments}
              handleViewAppointmentDetails={handleViewAppointmentDetails}
              handleCancelAppointment={handleCancelAppointment}
              handlePatientDeleteAppointment={handlePatientDeleteAppointment}
              handleViewMedicalRecord={handleViewMedicalRecord}
              handleViewOwnHistory={handleViewOwnHistory}
            />
          </div>
        </div>
      </main>

      {isDrugModalOpen && (
        <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 12000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>💊 Bảng giá thuốc niêm yết</h3>
              <button onClick={() => setIsDrugModalOpen(false)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>← Quay lại</button>
            </div>
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
          </div>
        </div>
      )}

      {isModalOpen && (() => {
        const step = wStep;
        const LABELS = ['Chọn khoa', 'Chọn bác sĩ', 'Chọn lịch', 'Xác nhận'];
        const doctorsInDept = (wDept && doctorList.some(d => (d.departmentId || d.department_id)))
          ? doctorList.filter(d => String(d.departmentId || d.department_id) === String(wDept.id))
          : doctorList;

        return (
          <div style={{ display:'flex', position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(15,23,42,0.65)', justifyContent:'center', alignItems:'center', zIndex:2000 }}>
            <div style={{ backgroundColor:'#fff', borderRadius:'20px', width:'560px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 90px rgba(0,0,0,0.35)', display:'flex', flexDirection:'column' }}>

              {/* ── HEADER ── */}
              <div style={{ padding:'22px 26px 14px', borderBottom:'1px solid #f1f5f9', position:'sticky', top:0, background:'#fff', zIndex:10, borderRadius:'20px 20px 0 0' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
                  <h3 style={{ margin:0, fontSize:'19px', fontWeight:'800', color:'#0f172a' }}>🗓️ Đặt lịch khám mới</h3>
                  <button onClick={() => {
                    if (step > 1 && step <= 4) {
                      setWStep(step - 1);
                    } else {
                      setIsModalOpen(false);
                      resetWizard();
                    }
                  }}
                    style={{ background:'#f1f5f9', border:'1px solid #cbd5e1', borderRadius:'8px', padding:'6px 12px', cursor:'pointer', fontSize:'13px', color:'#334155', fontWeight:'600' }}>
                    {step > 1 && step <= 4 ? '← Quay lại' : '✕ Đóng'}
                  </button>
                </div>
                {/* Step bar */}
                {step <= 4 && (
                  <div style={{ display:'flex', alignItems:'center' }}>
                    {LABELS.map((label, i) => (
                      <React.Fragment key={i}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                          <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800',
                            background: step > i+1 ? '#10b981' : step === i+1 ? '#0f6eff' : '#e2e8f0',
                            color: step >= i+1 ? '#fff' : '#94a3b8', transition:'all 0.2s' }}>
                            {step > i+1 ? '✓' : i+1}
                          </div>
                          <span style={{ fontSize:'10px', marginTop:'4px', fontWeight: step===i+1?'700':'400',
                            color: step===i+1?'#0f6eff': step>i+1?'#10b981':'#94a3b8' }}>{label}</span>
                        </div>
                        {i < 3 && <div style={{ flex:0.5, height:'2px', background: step>i+1?'#10b981':'#e2e8f0', marginBottom:'16px', borderRadius:'2px', transition:'all 0.3s' }} />}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* ── CONTENT ── */}
              <div style={{ padding:'24px 26px', flex:1 }}>

                {/* BƯỚC 1 – Chọn khoa */}
                {step === 1 && (
                  <div>
                    <p style={{ margin:'0 0 14px', color:'#64748b', fontSize:'13px' }}>Chọn khoa chuyên môn phù hợp với tình trạng của bạn:</p>
                    {departments.length === 0
                      ? <p style={{ textAlign:'center', color:'#94a3b8' }}>⏳ Đang tải danh sách khoa...</p>
                      : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                          {departments.map(dept => {
                            const id = dept.id || dept.departmentId;
                            const name = dept.name || dept.departmentName;
                            const sel = wDept?.id === id;
                            return (
                              <div key={id} onClick={() => {
                                setWDept({ id, name, description: dept.description });
                                setWDoctor(null);
                              }}
                                style={{ padding:'14px 16px', border:`2px solid ${sel?'#0f6eff':'#e2e8f0'}`,
                                  borderRadius:'12px', cursor:'pointer', transition:'all 0.15s',
                                  background: sel?'#eff6ff':'#fff',
                                  boxShadow: sel?'0 0 0 3px rgba(15,110,255,0.12)':'none' }}>
                                <div style={{ fontWeight:'700', fontSize:'13px', color: sel?'#0f6eff':'#0f172a' }}>🏥 {name}</div>
                                {dept.description && <div style={{ fontSize:'11px', color:'#64748b', marginTop:'4px', lineHeight:'1.4' }}>{dept.description}</div>}
                              </div>
                            );
                          })}
                        </div>
                    }
                  </div>
                )}

                {/* BƯỚC 2 – Chọn bác sĩ */}
                {step === 2 && (
                  <div>
                    <p style={{ margin:'0 0 14px', color:'#64748b', fontSize:'13px' }}>
                      Bác sĩ thuộc khoa <strong style={{ color:'#0f6eff' }}>{wDept?.name}</strong>:
                    </p>
                    {isLoadingDoctors ? (
                      <p style={{ textAlign:'center', padding:'30px', color:'#94a3b8' }}>⏳ Đang tải danh sách bác sĩ thuộc khoa...</p>
                    ) : doctorsInDept.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'30px', color:'#94a3b8' }}>
                        <div style={{ fontSize:'36px' }}>👨‍⚕️</div>
                        <p style={{ margin:'8px 0 0' }}>Khoa này chưa có bác sĩ được phân công.</p>
                      </div>
                    ) : <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                          {doctorsInDept.map(doc => {
                            const id = doc.id || doc.doctorId;
                            const name = doc.fullName || doc.name;
                            const sel = wDoctor?.id === id;
                            return (
                              <div key={id} onClick={() => setWDoctor({ id, fullName: name, specialization: doc.specialization, experienceYears: doc.experienceYears })}
                                style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px',
                                  border:`2px solid ${sel?'#0f6eff':'#e2e8f0'}`,
                                  borderRadius:'12px', cursor:'pointer',
                                  background: sel?'#eff6ff':'#fff',
                                  boxShadow: sel?'0 0 0 3px rgba(15,110,255,0.12)':'none',
                                  transition:'all 0.15s' }}>
                                <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=doctor${id}&backgroundColor=b6e3f4`}
                                  style={{ width:'50px', height:'50px', borderRadius:'50%', border:'2px solid #e2e8f0', flexShrink:0 }} alt="" />
                                <div style={{ flex:1 }}>
                                  <div style={{ fontWeight:'700', fontSize:'15px', color: sel?'#0f6eff':'#0f172a' }}>BS. {name}</div>
                                  <div style={{ fontSize:'12px', color:'#64748b', marginTop:'3px' }}>
                                    🔬 {doc.specialization || 'Đa khoa'}
                                    {doc.experienceYears && <span style={{ marginLeft:'12px' }}>⭐ {doc.experienceYears} năm kinh nghiệm</span>}
                                  </div>
                                </div>
                                {sel && <span style={{ color:'#0f6eff', fontSize:'20px', fontWeight:'bold' }}>✓</span>}
                              </div>
                            );
                          })}
                        </div>
                    }
                  </div>
                )}

                {/* BƯỚC 3 – Chọn ngày & giờ */}
                {step === 3 && (
                  <div>
                    <div style={{ marginBottom:'20px' }}>
                      <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#0f172a', marginBottom:'8px' }}>
                        📅 Chọn ngày khám (BS. <strong style={{ color:'#0f6eff' }}>{wDoctor?.fullName}</strong>):
                      </label>
                      <input type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={wDate}
                        onChange={e => {
                          const newDate = e.target.value;
                          setWDate(newDate);
                          setWTime('');
                          if (wDoctor?.id) {
                            computeBookedSlots(wDoctor.id, newDate);
                          }
                        }}
                        style={{ width:'100%', padding:'12px 14px', border:'2px solid #e2e8f0', borderRadius:'10px', fontSize:'15px', boxSizing:'border-box', outline:'none' }} />
                    </div>

                    {!wDate ? (
                      <div style={{ padding:'20px', textAlign:'center', color:'#64748b', background:'#f8fafc', borderRadius:'12px', border:'1px dashed #cbd5e1', fontSize:'13px' }}>
                        👉 Vui lòng chọn <strong>ngày khám</strong> để xem các ca khám 30 phút của Bác sĩ.
                      </div>
                    ) : isLoadingSlots ? (
                      <div style={{ padding:'24px', textAlign:'center', color:'#0f6eff', background:'#eff6ff', borderRadius:'12px', border:'1px solid #bfdbfe', fontSize:'14px', fontWeight:'600' }}>
                        ⏳ Đang kiểm tra lịch làm việc & ca bận của BS. {wDoctor?.fullName}...
                      </div>
                    ) : (
                      <div style={{ marginBottom:'20px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                          <label style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>⏰ Các ca khám ngày {wDate} (30 phút/ca):</label>
                          <div style={{ display:'flex', gap:'12px', fontSize:'11px' }}>
                            <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                              <span style={{ width:'10px', height:'10px', background:'#ef4444', borderRadius:'50%', display:'inline-block' }}></span>
                              <strong style={{ color:'#ef4444' }}>Bận</strong> (Màu đỏ - Khóa)
                            </span>
                            <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                              <span style={{ width:'10px', height:'10px', background:'#10b981', borderRadius:'50%', display:'inline-block' }}></span>
                              <strong style={{ color:'#10b981' }}>Rảnh</strong> (Được chọn)
                            </span>
                          </div>
                        </div>

                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
                          {ALL_TIME_SLOTS.map(slot => {
                            const booked = wBookedSlots.includes(slot);
                            const sel = wTime === slot;
                            return (
                              <button key={slot} disabled={booked} onClick={() => !booked && setWTime(slot)}
                                style={{
                                  padding:'10px 4px',
                                  borderRadius:'10px',
                                  border:`2px solid ${sel ? '#0f6eff' : booked ? '#fca5a5' : '#cbd5e1'}`,
                                  background: sel ? '#0f6eff' : booked ? '#fef2f2' : '#ffffff',
                                  color: sel ? '#ffffff' : booked ? '#dc2626' : '#334155',
                                  fontSize:'13px',
                                  fontWeight:'700',
                                  cursor: booked ? 'not-allowed' : 'pointer',
                                  display:'flex',
                                  flexDirection:'column',
                                  alignItems:'center',
                                  justifyContent:'center',
                                  boxShadow: sel ? '0 4px 12px rgba(15,110,255,0.25)' : 'none',
                                  transition:'all 0.15s'
                                }}>
                                <div>{slot}</div>
                                {booked ? (
                                  <span style={{ fontSize:'10px', marginTop:'2px', color:'#dc2626', background:'#fee2e2', padding:'1px 6px', borderRadius:'8px', fontWeight:'800' }}>
                                    ⛔ Bận
                                  </span>
                                ) : (
                                  <span style={{ fontSize:'10px', marginTop:'2px', color: sel ? '#ffffff' : '#16a34a', background: sel ? 'transparent' : '#dcfce7', padding:'1px 6px', borderRadius:'8px', fontWeight:'800' }}>
                                    {sel ? '✓ Chọn' : '🟢 Rảnh'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#0f172a', marginBottom:'8px' }}>📝 Triệu chứng / Lý do khám:</label>
                      <textarea value={wSymptoms} onChange={e => setWSymptoms(e.target.value)}
                        placeholder="Mô tả triệu chứng hoặc lý do khám của bạn..."
                        style={{ width:'100%', padding:'12px', border:'2px solid #e2e8f0', borderRadius:'10px', boxSizing:'border-box', minHeight:'75px', fontSize:'13px', resize:'vertical', outline:'none', fontFamily:'inherit' }} />
                    </div>
                  </div>
                )}

                {/* BƯỚC 4 – Xác nhận */}
                {step === 4 && (
                  <div>
                    <div style={{ background:'linear-gradient(135deg,#eff6ff,#f0fdf4)', borderRadius:'14px', padding:'20px', border:'1px solid #bfdbfe', marginBottom:'14px' }}>
                      <h4 style={{ margin:'0 0 14px', color:'#0f172a', fontSize:'15px' }}>✅ Thông tin lịch khám của bạn</h4>
                      <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'9px 18px', fontSize:'14px' }}>
                        <span style={{ color:'#64748b', fontWeight:'600' }}>🏥 Khoa:</span>
                        <strong style={{ color:'#0f172a' }}>{wDept?.name}</strong>
                        <span style={{ color:'#64748b', fontWeight:'600' }}>👨‍⚕️ Bác sĩ:</span>
                        <strong style={{ color:'#0f172a' }}>BS. {wDoctor?.fullName}</strong>
                        <span style={{ color:'#64748b', fontWeight:'600' }}>🔬 Chuyên khoa:</span>
                        <span style={{ color:'#334155' }}>{wDoctor?.specialization || 'Đa khoa'}</span>
                        <span style={{ color:'#64748b', fontWeight:'600' }}>📅 Ngày khám:</span>
                        <strong style={{ color:'#0f6eff' }}>{wDate}</strong>
                        <span style={{ color:'#64748b', fontWeight:'600' }}>⏰ Ca khám (30p):</span>
                        <strong style={{ color:'#0f6eff' }}>{wTime}</strong>
                        {wSymptoms && <><span style={{ color:'#64748b', fontWeight:'600' }}>📝 Triệu chứng:</span><span style={{ color:'#334155' }}>{wSymptoms}</span></>}
                      </div>
                    </div>
                    <p style={{ margin:0, fontSize:'12px', color:'#94a3b8', textAlign:'center' }}>Kiểm tra lại thông tin và bấm <strong>"Xác nhận đặt lịch"</strong> để hoàn tất.</p>
                  </div>
                )}

                {/* BƯỚC 5 – Đăng ký thành công */}
                {step === 5 && (
                  <div style={{ textAlign:'center', padding:'16px 0' }}>
                    <div style={{ fontSize:'60px', marginBottom:'14px' }}>🎉</div>
                    <h3 style={{ margin:'0 0 10px', color:'#10b981', fontSize:'22px', fontWeight:'800' }}>Đăng ký thành công!</h3>
                    <p style={{ color:'#475569', fontSize:'14px', lineHeight:'1.7', margin:'0 0 20px' }}>
                      Lịch hẹn với <strong>BS. {wDoctor?.fullName}</strong> ({wDept?.name})<br />
                      vào ngày <strong style={{ color:'#0f6eff' }}>{wDate}</strong> lúc <strong style={{ color:'#0f6eff' }}>{wTime}</strong><br />
                      đã được ghi nhận thành công và ca khám này đã được đánh dấu là <strong style={{ color:'#ef4444' }}>⛔ Bận</strong>.
                    </p>
                    <p style={{ fontSize:'12px', color:'#94a3b8', margin:0 }}>Vui lòng đến đúng giờ và mang theo CMND/CCCD.</p>
                    <button onClick={() => { setIsModalOpen(false); resetWizard(); }}
                      style={{ marginTop:'20px', padding:'12px 36px', background:'#10b981', color:'#fff', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'700', cursor:'pointer' }}>
                      Xem lịch hẹn của tôi
                    </button>
                  </div>
                )}
              </div>

              {/* ── FOOTER BUTTONS ── */}
              {step <= 4 && (
                <div style={{ padding:'16px 26px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', position:'sticky', bottom:0, background:'#fff', borderRadius:'0 0 20px 20px' }}>
                  {step < 4
                    ? <button
                        disabled={(step===1&&!wDept)||(step===2&&!wDoctor)||(step===3&&(!wDate||!wTime))}
                        onClick={() => setWStep(step+1)}
                        style={{ padding:'10px 26px', background:'#0f6eff', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontSize:'14px',
                          opacity:((step===1&&!wDept)||(step===2&&!wDoctor)||(step===3&&(!wDate||!wTime)))?0.35:1, transition:'opacity 0.2s' }}>
                        Tiếp theo →
                      </button>
                    : <button onClick={handleCreateAppointment}
                        style={{ padding:'10px 26px', background:'#10b981', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontSize:'14px' }}>
                        🎉 Xác nhận đặt lịch
                      </button>
                  }
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {isApptDetailModalOpen && apptDetails && (
        <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 11000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '400px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>📄 Chi tiết lịch khám #{apptDetails.id}</h3>
              <button onClick={() => setIsApptDetailModalOpen(false)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>← Quay lại</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px', color: '#334155', textAlign: 'left' }}>
              <p style={{ margin: 0 }}><strong>👨‍⚕️ Bác sĩ điều trị:</strong> {apptDetails.doctorName || 'Chưa cập nhật'}</p>
              <p style={{ margin: 0 }}><strong>👤 Bệnh nhân:</strong> {apptDetails.patientName || 'Chưa cập nhật'}</p>
              <p style={{ margin: 0 }}><strong>📅 Ngày khám bệnh:</strong> {apptDetails.appointmentDate}</p>
              <p style={{ margin: 0 }}><strong>⏰ Giờ đăng ký:</strong> {apptDetails.startTime}</p>
              <p style={{ margin: 0 }}><strong>⚠️ Triệu chứng:</strong> {apptDetails?.symptoms || apptDetails?.symptom || apptDetails?.reason || apptDetails?.note || apptDetails?.description || 'Không có ghi chú'}</p>
              <p style={{ margin: 0 }}><strong>📌 Trạng thái lịch:</strong> <span className={`status-badge ${apptDetails.status === 'PENDING' ? 'pending' : (apptDetails.status === 'CANCELLED' ? 'cancelled' : 'confirmed')}`}>{apptDetails.status}</span></p>
            </div>
          </div>
        </div>
      )}

      {isRecordDetailModalOpen && recordDetails && (
        <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 15000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '500px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>🩺 Chi tiết Bệnh án #{recordDetails.id}</h3>
              <button onClick={() => setIsRecordDetailModalOpen(false)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>← Quay lại</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px', color: '#334155', textAlign: 'left' }}>
              <p style={{ margin: 0 }}><strong>Mã Lịch hẹn:</strong> #{recordDetails.appointmentID || recordDetails.appointmentId || 'Chưa rõ'}</p>
              <p style={{ margin: 0 }}><strong>Chẩn đoán:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{recordDetails.diagnosis}</span></p>
              <p style={{ margin: 0 }}><strong>Kế hoạch điều trị:</strong> {recordDetails.treatmentPlan || 'Không có ghi chú'}</p>
              <p style={{ margin: 0 }}><strong>Ngày lập:</strong> {recordDetails.createdAt ? new Date(recordDetails.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ'}</p>
              <p style={{ margin: 0 }}><strong>Ngày hẹn tái khám:</strong> {recordDetails.reexaminationDate || 'Không có hẹn'}</p>
            </div>
            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '15px', marginTop: '5px', textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>💊 Đơn thuốc đính kèm</h4>
              {recordDetails.prescriptionDetails && recordDetails.prescriptionDetails.length > 0 ? (
                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recordDetails.prescriptionDetails.map((med, idx) => (
                    <li key={idx} style={{ color: '#334155' }}>
                      <strong style={{ color: '#0f6eff' }}>{med.medicineName}</strong> - Số lượng: <strong>{med.quantity}</strong> {med.unit}
                      <br /><span style={{ fontSize: '13px', color: '#64748b' }}>Cách dùng: {med.dosage}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontStyle: 'italic', color: '#64748b' }}>Không có đơn thuốc nào được kê.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {isHistoryModalOpen && (
        <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 16000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '650px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2563eb', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#2563eb' }}>📒 Sổ Khám Bệnh Điện Tử Của Bạn</h3>
              <button onClick={() => { setIsHistoryModalOpen(false); setHistoryRecords([]); }} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>← Quay lại</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
              {historyRecords.length > 0 ? historyRecords.map((rec) => (
                <div key={rec.id} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold' }}>🗓️ Mã bệnh án: #{rec.id}</span>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Ngày hẹn tái khám: {rec.reexaminationDate || 'Không có lịch hẹn'}</span>
                  </div>
                  <p style={{ margin: '0 0 6px 0' }}><strong>Bác sĩ kết luận bệnh:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{rec.diagnosis}</span></p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><strong>Lời dặn & Hướng điều trị:</strong> {rec.treatmentPlan || 'Hãy uống thuốc theo đơn đính kèm.'}</p>
                  <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f6eff' }}>💊 Đơn thuốc bác sĩ bốc:</span>
                    {rec.prescriptionDetails && rec.prescriptionDetails.length > 0 ? (
                      <ul style={{ margin: '5px 0 0 0', paddingLeft: '15px', fontSize: '13px' }}>
                        {rec.prescriptionDetails.map((med, idx) => (
                          <li key={idx}>{med.medicineName} (Số lượng: {med.quantity} viên) - <span style={{ color: '#64748b' }}>{med.dosage}</span></li>
                        ))}
                      </ul>
                    ) : <span style={{ fontSize: '13px', fontStyle: 'italic', color: '#94a3b8' }}> Không có đơn thuốc đi kèm.</span>}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>📭 Hồ sơ bệnh án điện tử của bạn hiện chưa có dữ liệu nào trên máy chủ.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {isDrugDetailModalOpen && drugDetails && (
        <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 13000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '350px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>💊 Thông tin chi tiết thuốc</h3>
              <button onClick={() => setIsDrugDetailModalOpen(false)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>← Quay lại</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px', color: '#334155', textAlign: 'left' }}>
              <p style={{ margin: 0 }}><strong>Tên thuốc:</strong> <span style={{ color: '#0f6eff', fontWeight: 'bold' }}>{drugDetails.name}</span></p>
              <p style={{ margin: 0 }}><strong>Đơn vị tính:</strong> {drugDetails.unit || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
