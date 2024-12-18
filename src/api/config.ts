import axios, { AxiosResponse } from 'axios';
import type { ApiResponse } from '../types/api';

export const API_BASE_URL = 'http://127.0.0.1:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 这里可以添加认证 token 等
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // 如果响应成功，直接返回数据
        if (response.status >= 200 && response.status < 300) {
            // 检查是否是标准的 API 响应格式
            const data = response.data;
            if (data && typeof data === 'object') {
                if ('code' in data) {
                    // 如果是标准格式，检查状态码
                    if (data.code === 0 || data.code === 200) {
                        return data as ApiResponse<unknown>;
                    } else {
                        // 如果状态码不正确，抛出错误
                        return Promise.reject(new Error(data.message || '请求失败'));
                    }
                }
                // 如果不是标准格式，包装成标准格式
                return {
                    code: 200,
                    message: 'success',
                    data: data
                } as ApiResponse<unknown>;
            }
        }
        return Promise.reject(new Error('请求失败'));
    },
    (error) => {
        // 统一错误处理
        if (error.response) {
            const { status } = error.response;
            let message = '';
            switch (status) {
                case 400:
                    message = '请求参数错误';
                    break;
                case 401:
                    message = '未授权，请登录';
                    break;
                case 403:
                    message = '拒绝访问';
                    break;
                case 404:
                    message = '请求的资源不存在';
                    break;
                case 500:
                    message = '服务器错误';
                    break;
                default:
                    message = '网络错误';
            }
            console.error(`[API Error] ${status}: ${message}`);
            return Promise.reject(new Error(message));
        }
        if (error.request) {
            console.error('[API Error] 网络错误，请检查您的网络连接');
            return Promise.reject(new Error('网络错误，请检查您的网络连接'));
        }
        console.error('[API Error]', error.message);
        return Promise.reject(error);
    }
);

export default apiClient; 