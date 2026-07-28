import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAPI } from './services/authService';
import './style/base.css'; // Đảm bảo đúng đường dẫn CSS của bạn

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 🚀 THÊM: State quản lý trạng thái Ẩn/Hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const response = await loginAPI(formData);
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userRole = response.data.role;
        const checkPass = response.data.checkPass;

        // ĐÃ SỬA: Nếu checkPass === true thì ép sang trang đổi mật khẩu
        if (checkPass === true) {
          navigate('/change-password');
        } else {
          // Nếu checkPass === false thì vào thẳng Dashboard
          if (userRole === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (userRole === 'DOCTOR') {
            navigate('/doctor/dashboard');
          } else if (userRole === 'PATIENT') {
            navigate('/patient/dashboard');
          } else {
            setErrorMsg('Vai trò người dùng không hợp lệ.');
          }
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      if (error.response && error.response.data) {
        const beMessage = error.response.data.message;
        if (beMessage === 'account.not.verified') {
          setErrorMsg('Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn!');
        } else {
          setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
      } else {
        setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Tự động xóa token rác ngay khi người dùng vừa mở trang Đăng nhập
  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  const handleQuickLogin = (role) => {
    const fakeToken = "mock_jwt_token_" + role + "_" + Date.now();
    localStorage.setItem('token', fakeToken);
    if (role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (role === 'DOCTOR') {
      navigate('/doctor/dashboard');
    } else if (role === 'PATIENT') {
      navigate('/patient/dashboard');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          style={{ 
            position: 'absolute', 
            top: '15px', 
            right: '15px', 
            background: 'transparent', 
            border: 'none', 
            color: '#ef4444', 
            fontSize: '22px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            lineHeight: 1,
            padding: '4px 8px'
          }}
          title="Đóng / Quay lại"
        >
          ✕
        </button>
        <h2>Đăng Nhập MediPro</h2>
        {errorMsg && <p className="error-text" style={{ color: 'red' }}>{errorMsg}</p>}

        <div className="input-group">
          <label>Tên đăng nhập</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        {/* 🚀 CẬP NHẬT: Thêm nút Con Mắt vào Input Mật khẩu */}
        <div className="input-group">
          <label>Mật khẩu</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              // Đổi type qua lại giữa text và password dựa trên state
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                outline: 'none',
                color: '#64748b'
              }}
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {/* Hiển thị Emoji khác nhau tùy trạng thái */}
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: '#0f6eff', textDecoration: 'none', fontWeight: '600' }}>
            Quên mật khẩu?
          </Link>
        </div>

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>

        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>

        {/* 🧪 KHU VỰC ĐĂNG NHẬP GIẢ LẬP ĐỂ TEST GIAO DIỆN FE */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px dashed #cbd5e1', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '10px', fontWeight: '600' }}>
            🧪 Đăng nhập nhanh Giả lập (Không cần Backend):
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button type="button" onClick={() => handleQuickLogin('ADMIN')} style={{ padding: '8px 12px', background: '#eff6ff', color: '#0f6eff', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
              🛡️ Admin
            </button>
            <button type="button" onClick={() => handleQuickLogin('DOCTOR')} style={{ padding: '8px 12px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
              👨‍⚕️ Bác sĩ
            </button>
            <button type="button" onClick={() => handleQuickLogin('PATIENT')} style={{ padding: '8px 12px', background: '#fefce8', color: '#854d0e', border: '1px solid #fef08a', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
              👤 Bệnh nhân
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;