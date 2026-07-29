// Bộ giả lập API toàn diện cho MediPro khi Backend chưa kết nối hoặc bị lỗi mạng

const MOCK_DEPARTMENTS = [
  { id: 1, name: 'Khoa Tim Mạch', description: 'Chuyên khoa sức khỏe tim mạch & huyết áp' },
  { id: 2, name: 'Khoa Nội Tổng Quát', description: 'Chẩn đoán và điều trị bệnh lý nội khoa' },
  { id: 3, name: 'Khoa Nhi', description: 'Chăm sóc & điều trị sức khỏe cho trẻ em' },
  { id: 4, name: 'Khoa Ngoại Tổng Hợp', description: 'Phẫu thuật và can thiệp ngoại khoa' },
  { id: 5, name: 'Khoa Mắt', description: 'Khám và điều trị các bệnh lý về nhãn khoa' },
  { id: 6, name: 'Khoa Tai Mũi Họng', description: 'Chẩn đoán và điều trị Tai Mũi Họng' }
];

const MOCK_DOCTORS = [
  { id: 24, fullName: 'BS. Phạm Quang An', email: 'quangan@medipro.com', specialization: 'Tim Mạch', departmentId: 1, departmentName: 'Khoa Tim Mạch', experienceYears: 12 },
  { id: 101, fullName: 'BS. Lê Bảo Nhung', email: 'baonhung@medipro.com', specialization: 'Nội tổng quát', departmentId: 2, departmentName: 'Khoa Nội Tổng Quát', experienceYears: 15 },
  { id: 102, fullName: 'BS. Huỳnh Hữu Bình', email: 'huubinh@medipro.com', specialization: 'Nhi khoa', departmentId: 3, departmentName: 'Khoa Nhi', experienceYears: 10 },
  { id: 103, fullName: 'BS. Lê Đức An', email: 'ducan@medipro.com', specialization: 'Ngoại khoa', departmentId: 4, departmentName: 'Khoa Ngoại Tổng Hợp', experienceYears: 8 },
  { id: 104, fullName: 'BS. Huỳnh Hồng Lan', email: 'honglan@medipro.com', specialization: 'Mắt', departmentId: 5, departmentName: 'Khoa Mắt', experienceYears: 7 },
  { id: 105, fullName: 'BS. Hồ Trọng Vũ', email: 'trongvu@medipro.com', specialization: 'Tai Mũi Họng', departmentId: 6, departmentName: 'Khoa Tai Mũi Họng', experienceYears: 11 }
];

const MOCK_PATIENTS = [
  { id: 71, patientId: 71, userId: 71, patientCode: 'P-71', name: 'Trần Lan Lan', fullName: 'Trần Lan Lan', email: 'lanlan@gmail.com', role: 'PATIENT' },
  { id: 1000, patientId: 1000, userId: 1000, patientCode: 'P-1000', name: 'Trần Lan Lan', fullName: 'Trần Lan Lan', email: 'lanlan@gmail.com', role: 'PATIENT' },
  { id: 1001, patientId: 1001, userId: 1001, patientCode: 'P-1001', name: 'Phạm Quang An', fullName: 'Phạm Quang An', email: 'quangan@gmail.com', role: 'PATIENT' },
  { id: 1002, patientId: 1002, userId: 1002, patientCode: 'P-1002', name: 'Huỳnh Thị Linh', fullName: 'Huỳnh Thị Linh', email: 'thilinh@gmail.com', role: 'PATIENT' },
  { id: 1003, patientId: 1003, userId: 1003, patientCode: 'P-1003', name: 'Ngô Tuyết Hà', fullName: 'Ngô Tuyết Hà', email: 'tuyetha@gmail.com', role: 'PATIENT' },
  { id: 1004, patientId: 1004, userId: 1004, patientCode: 'P-1004', name: 'Vũ Quốc Bảo', fullName: 'Vũ Quốc Bảo', email: 'quocbao@gmail.com', role: 'PATIENT' }
];

const MOCK_DRUGS = [
  { id: 1, name: 'Paracetamol 500mg', code: 'MED-001', price: 15000, stock: 500, unit: 'Viên', usage: 'Uống sau ăn 1 viên/lần' },
  { id: 2, name: 'Amoxicillin 500mg', code: 'MED-002', price: 35000, stock: 200, unit: 'Vỉ', usage: 'Sáng 1 vỉ, Tối 1 vỉ' },
  { id: 3, name: 'Berberin 100mg', code: 'MED-003', price: 20000, stock: 350, unit: 'Lọ', usage: 'Uống 2-4 viên/lần khi đau bụng' },
  { id: 4, name: 'Panadol Extra', code: 'MED-004', price: 45000, stock: 180, unit: 'Hộp', usage: 'Giảm đau hạ sốt nhanh' },
  { id: 5, name: 'Efferalgan 500mg', code: 'MED-005', price: 48000, stock: 150, unit: 'Hộp', usage: 'Phai vào 200ml nước uống' },
  { id: 6, name: 'Ibuprofen 400mg', code: 'MED-006', price: 30000, stock: 120, unit: 'Vỉ', usage: 'Uống giảm đau kháng viêm' }
];

const MOCK_APPOINTMENTS = [
  { id: 172, patientId: 71, patientName: 'Trần Lan Lan', doctorId: 24, doctorName: 'BS. Phạm Quang An', departmentName: 'Khoa Tim Mạch', appointmentDate: '2026-07-30', startTime: '08:00:00', symptoms: 'Đau ngực nhẹ khi vận động', status: 'CONFIRMED' },
  { id: 171, patientId: 1001, patientName: 'Phạm Quang An', doctorId: 24, doctorName: 'BS. Phạm Quang An', departmentName: 'Khoa Tim Mạch', appointmentDate: '2026-07-30', startTime: '09:30:00', symptoms: 'Tái khám huyết áp cao', status: 'CONFIRMED' },
  { id: 170, patientId: 1002, patientName: 'Huỳnh Thị Linh', doctorId: 24, doctorName: 'BS. Phạm Quang An', departmentName: 'Khoa Tim Mạch', appointmentDate: '2026-07-30', startTime: '10:30:00', symptoms: 'Đau vai gáy, mệt mỏi', status: 'CONFIRMED' },
  { id: 169, patientId: 1003, patientName: 'Ngô Tuyết Hà', doctorId: 24, doctorName: 'BS. Phạm Quang An', departmentName: 'Khoa Tim Mạch', appointmentDate: '2026-07-30', startTime: '14:00:00', symptoms: 'Theo dõi chỉ số tim mạch', status: 'CONFIRMED' },
  { id: 168, patientId: 1004, patientName: 'Vũ Quốc Bảo', doctorId: 24, doctorName: 'BS. Phạm Quang An', departmentName: 'Khoa Tim Mạch', appointmentDate: '2026-07-30', startTime: '15:30:00', symptoms: 'Tư vấn chế độ ăn tim mạch', status: 'PENDING' }
];

const MOCK_RECORDS = [
  { id: 501, patientId: 71, patientName: 'Trần Lan Lan', doctorId: 24, doctorName: 'BS. Phạm Quang An', diagnosis: 'Rối loạn nhịp tim nhẹ', treatmentPlan: 'Nghỉ ngơi, dùng thuốc theo đơn 14 ngày', reexaminationDate: '2026-08-15', recordDate: '2026-06-13', medicines: [{ medicineId: 1, name: 'Paracetamol 500mg', quantity: 20, dosage: 'Sáng 1 viên, Tối 1 viên' }] },
  { id: 502, patientId: 1000, patientName: 'Trần Lan Lan', doctorId: 102, doctorName: 'BS. Huỳnh Hữu Bình', diagnosis: 'Viêm họng cấp', treatmentPlan: 'Uống thuốc 7 ngày, súc miệng nước muối', reexaminationDate: '2026-07-10', recordDate: '2026-07-01', medicines: [{ medicineId: 2, name: 'Amoxicillin 500mg', quantity: 14, dosage: 'Sáng 1 vỉ, Tối 1 vỉ' }] }
];

export const handleMockApi = (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';

  console.log(`⚡ [MOCK API] ${method.toUpperCase()} ${url}`);

  // 1. Authentication
  if (url.includes('/auth/authentication')) {
    const data = JSON.parse(config.data || '{}');
    const userLower = (data.username || '').toLowerCase();
    let role = 'PATIENT';
    if (userLower.includes('admin')) role = 'ADMIN';
    else if (userLower.includes('doc') || userLower.includes('bs') || userLower.includes('doctor')) role = 'DOCTOR';

    return {
      status: 200,
      data: {
        code: 1000,
        data: {
          token: `mock_jwt_token_${role}_${Date.now()}`,
          role: role,
          user: { id: role === 'DOCTOR' ? 24 : 71, username: data.username, fullName: data.username.toUpperCase(), role: role }
        }
      }
    };
  }

  if (url.includes('/auth/registration')) {
    return { status: 200, data: { code: 1000, message: 'Đăng ký thành công!' } };
  }

  // 2. Current User (/users/me)
  if (url.includes('/users/me')) {
    const token = localStorage.getItem('token') || '';
    let role = 'PATIENT';
    let fullName = 'Trần Lan Lan';
    let id = 71;

    if (token.includes('DOCTOR') || token.includes('doctor')) {
      role = 'DOCTOR';
      fullName = 'BS. Phạm Quang An';
      id = 24;
    } else if (token.includes('ADMIN') || token.includes('admin')) {
      role = 'ADMIN';
      fullName = 'Quản trị viên MediPro';
      id = 1;
    }

    return {
      status: 200,
      data: {
        code: 1000,
        data: { id, userId: id, doctorId: id, patientId: id, username: role.toLowerCase(), fullName, role, specialization: 'Đa khoa', email: `${role.toLowerCase()}@medipro.com` }
      }
    };
  }

  // 3. Appointments (/appointments)
  if (url.includes('/appointments')) {
    // GET /appointments/:id
    const idMatch = url.match(/\/appointments\/(\d+)/);
    if (idMatch && method === 'get') {
      const apptId = parseInt(idMatch[1]);
      const appt = MOCK_APPOINTMENTS.find(a => a.id === apptId) || MOCK_APPOINTMENTS[0];
      return { status: 200, data: { code: 1000, data: appt } };
    }

    // PATCH /appointments/:id/status
    if (url.includes('/status') && method === 'patch') {
      const data = JSON.parse(config.data || '{}');
      return { status: 200, data: { code: 1000, message: `Đã cập nhật trạng thái thành ${data.status || 'OK'}` } };
    }

    // POST /appointments
    if (method === 'post') {
      const newAppt = JSON.parse(config.data || '{}');
      const created = { id: Date.now(), status: 'PENDING', ...newAppt };
      MOCK_APPOINTMENTS.unshift(created);
      return { status: 200, data: { code: 1000, data: created, message: 'Đặt lịch khám thành công!' } };
    }

    // GET /appointments
    return {
      status: 200,
      data: {
        code: 1000,
        data: { content: MOCK_APPOINTMENTS, totalElements: MOCK_APPOINTMENTS.length, totalPages: 1 }
      }
    };
  }

  // 4. Departments (/departments)
  if (url.includes('/departments')) {
    return {
      status: 200,
      data: {
        code: 1000,
        data: { departmentResponseList: MOCK_DEPARTMENTS, content: MOCK_DEPARTMENTS }
      }
    };
  }

  // 5. Doctors (/doctors)
  if (url.includes('/doctors')) {
    return {
      status: 200,
      data: {
        code: 1000,
        data: { content: MOCK_DOCTORS, totalElements: MOCK_DOCTORS.length }
      }
    };
  }

  // 6. Medicines (/medicines)
  if (url.includes('/medicines')) {
    return {
      status: 200,
      data: {
        code: 1000,
        data: { content: MOCK_DRUGS, totalElements: MOCK_DRUGS.length }
      }
    };
  }

  // 7. Users (/users)
  if (url.includes('/users')) {
    return {
      status: 200,
      data: {
        code: 1000,
        data: { users: MOCK_PATIENTS, content: MOCK_PATIENTS, totalElements: MOCK_PATIENTS.length }
      }
    };
  }

  // 8. Medical Records (/medical-records)
  if (url.includes('/medical-records')) {
    if (method === 'post') {
      return { status: 200, data: { code: 1000, message: 'Đã lập bệnh án thành công!', data: { id: Date.now() } } };
    }
    return {
      status: 200,
      data: {
        code: 1000,
        data: MOCK_RECORDS
      }
    };
  }

  // Fallback default response
  return {
    status: 200,
    data: {
      code: 1000,
      data: []
    }
  };
};
