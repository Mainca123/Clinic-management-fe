import axios from 'axios';
import { handleMockApi } from '../services/mockAdapter';

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

// 🚀 Bộ Đánh Chặn Phản Hồi + Giả Lập API Toàn Diện
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config || {};
    
    // Nếu Backend không phản hồi (Lỗi mạng / Chưa bật Server / 404 / 500) -> Chuyển sang Bộ Giả Lập (Mock API)
    if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.response?.status >= 404) {
      console.warn("⚠️ Backend không phản hồi -> Sử dụng Bộ Giả Lập Dữ Liệu (Mock API) cho:", config.url);
      const mockResponse = handleMockApi(config);
      return Promise.resolve(mockResponse);
    }

    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');
      if (token && token.startsWith('mock_jwt_token_')) {
        return Promise.resolve(handleMockApi(config));
      }

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