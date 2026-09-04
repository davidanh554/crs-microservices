import axios from 'axios';
import type { ApiKey, CreateApiKeyRequest, CreateApiKeyResponse } from '../types/apiKey';

// Gọi qua cổng Gateway (8080) với tiền tố /api/api-keys
const API_URL = 'http://localhost:8080/api/api-keys';

// Hàm phụ trợ lấy Header chứa Token JWT của Admin
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    };
};

export const apiKeyService = {
    /**
     * Lấy toàn bộ danh sách API Key
     * GET http://localhost:8080/api/api-keys
     */
    getAllKeys: async (): Promise<ApiKey[]> => {
        const response = await axios.get<ApiKey[]>(API_URL, getAuthHeaders());
        return response.data;
    },

    /**
     * Tạo mới một API Key cho đối tác
     * POST http://localhost:8080/api/api-keys
     */
    createKey: async (data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
        const response = await axios.post<CreateApiKeyResponse>(API_URL, data, getAuthHeaders());
        return response.data;
    },

    /**
     * Thu hồi (vô hiệu hóa) một API Key
     * PUT/DELETE http://localhost:8080/api/api-keys/{id}/revoke
     */
    revokeKey: async (id: number): Promise<void> => {
        await axios.put(`${API_URL}/${id}/revoke`, {}, getAuthHeaders());
    }
};