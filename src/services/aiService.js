import api from '../utils/api';

/**
 * Chuẩn hóa response vì một số môi trường có thể bọc dữ liệu trong `data`.
 * @param {object} apiResponse Axios response hoặc dữ liệu thô
 * @returns {{message: string, tool: string|null, success: boolean, payload: any, metadata: object}}
 */
export const normalizeAIResponse = (apiResponse) => {
    const raw = apiResponse?.data ?? apiResponse ?? {};
    const data = raw?.data && typeof raw.data === 'object' && (
        raw.data.message !== undefined ||
        raw.data.tool !== undefined ||
        raw.data.metadata !== undefined
    ) ? raw.data : raw;

    return {
        message: typeof data === 'string'
            ? data
            : data?.message || data?.reply || data?.content || 'AI chưa trả lời được. Vui lòng thử lại.',
        tool: data?.tool || null,
        success: data?.success !== false,
        payload: data?.payload ?? null,
        metadata: data?.metadata || {}
    };
};

/**
 * Gửi tin nhắn đến AI Assistant.
 * Lần đầu conversationId là null; những lần sau dùng ID backend trả về.
 * @param {{message: string, conversationId?: string|null}} request
 * @returns {Promise<ReturnType<typeof normalizeAIResponse>>}
 */
export const chatAIAPI = async ({ message, conversationId = null }) => {
    const response = await api.post('/ai/chat', {
        message: message.trim(),
        conversationId
    });

    return normalizeAIResponse(response);
};
