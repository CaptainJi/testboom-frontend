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
    // 移除默认的 Content-Type，让每个请求自己设置
    // headers: {
    //     'Content-Type': 'application/json',
    // },
});

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 添加更详细的错误日志
        if (error.response) {
            console.error('API响应错误:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            console.error('API请求错误:', error.request);
        } else {
            console.error('API错误:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient; 