import axios from 'axios';

// API基础配置
export const API_CONFIG = {
    baseURL: '',  // 使用相对路径，由nginx处理代理
    timeout: 30000
};

// 创建axios实例
const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API请求错误:', error);
        return Promise.reject(error);
    }
);

export default apiClient; 