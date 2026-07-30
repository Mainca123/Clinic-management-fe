import api from '../utils/api';

/**
 * Gửi câu hỏi/tin nhắn tới AI Assistant
 * @param {string} messageText 
 * @returns {Promise} Axios response
 */
export const chatAIAPI = async (messageText) => {
    return await api.post('/ai/chat', { message: messageText });
};
