import api from '../utils/api';

export const loginAPI = async (loginData) => {
    try {
        const response = await api.post('/auth/authentication', loginData);
        return response.data;
    } catch (error) {
        // 🚀 Bộ Giả Lập Backend khi Backend thực tế chưa bật
        if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
            console.warn("⚠️ Backend thực chưa kết nối -> Đã kích hoạt Bộ Giả Lập Đăng Nhập (Mock Backend)");
            const userLower = (loginData.username || '').toLowerCase();
            let role = 'PATIENT';
            if (userLower.includes('admin')) {
                role = 'ADMIN';
            } else if (userLower.includes('doc') || userLower.includes('bs') || userLower.includes('doctor')) {
                role = 'DOCTOR';
            }

            return {
                data: {
                    token: "mock_jwt_token_" + role + "_" + Date.now(),
                    role: role,
                    checkPass: false,
                    user: {
                        username: loginData.username,
                        fullName: loginData.username.toUpperCase(),
                        role: role
                    }
                }
            };
        }
        throw error;
    }
};

export const registerAPI = async (registerData) => {
    const response = await api.post('/auth/registration', registerData);
    return response.data;
};

export const verifyEmailAPI = async (token) => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
};

export const resetPasswordAPI = async (email) => {
    return await api.patch(`/auth/password-resets?email=${email}`);
};


export const changePasswordAPI = async (passwordData) => {
    return await api.patch('/users/password', passwordData);
};
export const getCurrentUserAPI = async () => {
    return await api.get('/users/me');
};
export const updateProfileAPI = async (profileData) => {
    return await api.patch('/users', profileData);
};

export const uploadAvatarAPI = async (formData) => {
    return await api.patch('/users/me/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};