import api from '../utils/api';

// Gọi API tạo lịch hẹn mới (POST /api/v1/appointments)
export const createAppointmentAPI = async (appointmentData) => {
    return await api.post('/appointments', appointmentData);
};
// lấy danh sách lịch hẹn
export const getAllAppointmentsAPI = async (page = 0, size = 10) => {
    return await api.get(`/appointments?page=${page}&size=${size}`);
};
// xem chi chi tiết một lịch hẹn
export const getAppointmentDetailsAPI = async (id) => {
    return await api.get(`/appointments/${id}`);
};

export const confirmAppointmentAPI = async (id) => {
    const payload = { status: "CONFIRMED" };
    return await api.patch(`/appointments/${id}/status`, payload);
};

export const cancelAppointmentAPI = async (id, reasonText) => {
    const payload = { 
        status: "CANCELLED",
        reason: reasonText
    };
    return await api.patch(`/appointments/${id}/status`, payload);
};

// Cập nhật trạng thái lịch hẹn chung (PATCH /api/v1/appointments/:id/status)
export const updateAppointmentStatusAPI = async (id, status, reason = '') => {
    const payload = { status, reason };
    return await api.patch(`/appointments/${id}/status`, payload);
};

// Chuyển trạng thái lịch hẹn sang COMPLETED khi khám xong
export const completeAppointmentAPI = async (id) => {
    return await updateAppointmentStatusAPI(id, 'COMPLETED');
};


// Lấy lịch hẹn/thông tin ca của bác sĩ theo ngày (GET /api/v1/appointments/doctors/{doctorId}?date={date})
export const getAppointmentsByDoctorAndDateAPI = async (doctorId, date) => {
    let url = `/appointments/doctors/${doctorId}`;
    if (date) {
        url += `?date=${date}`;
    }
    return await api.get(url);
};

// xóa/hủy trạng thái lịch hẹn
export const deleteAppointmentAPI = async (id) => {
    return await api.patch(`/appointments/${id}/status/delete`);
};

// Thay đổi URL gọi sang API Users (Lấy tối đa 100 người để không bị thiếu)
export const getPatientsByDoctorAPI = async (doctorId) => {
    return await api.get('/users?page=0&size=100'); 
};


// admin gọi bệnh nhân theo bác sĩ
export const getPatientsByDoctorForAdminAPI = async (doctorId, page = 0, size = 100) => {
    return await api.get(`/users/patients-by-doctor?doctorId=${doctorId}&page=${page}&size=${size}`);
};