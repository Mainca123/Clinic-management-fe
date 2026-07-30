import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Bộ Đánh Chặn Phản Hồi (Xử lý lỗi Token hết hạn)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Cảnh báo: Token hết hạn hoặc không hợp lệ! Tự động dọn rác localStorage...");
      localStorage.removeItem('token');

      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/forgot-password' && currentPath !== '/register') {
        alert('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;