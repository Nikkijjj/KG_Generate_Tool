/*jshint esversion: 9 */
/**
 * http请求配置
 */
import axios from 'axios';
import { userDataStore } from '@/store/user';
import router from '@/router';
import { isTokenExpired } from '@/common/tokenTools';

const baseApiURL = import.meta.env.VITE_APP_baseApiURL;
const timeout = 50000000;

export const service = axios.create({
    baseURL: baseApiURL,
    timeout: timeout,
    withCredentials: true
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        // 跳过不需要 token 的接口
        const skipAuthUrls = ['/public/login', '/public/captcha', '/public/send_code', '/public/register'];
        if (skipAuthUrls.includes(config.url)) {
            return config;
        }
        const userData = userDataStore();
        const token = localStorage.getItem('token') || userData.userInfo.token;

        if (token) {
            if (isTokenExpired(token)) {
                handleTokenExpired();
                return Promise.reject(new Error('Token 已过期'));
            }
            config.headers.Authorization = `Bearer ${token}`; // 标准格式
        }
        return config;
    },
    (error) => {
        return Promise.reject({ msg: '请求配置错误', detail: error });
    },
);

// 响应拦截器
let isTokenExpiredModalShow = false;
service.interceptors.response.use(
    (response) => {
        const data = response.data;
        if (!data) {
            return Promise.reject({ msg: '响应数据格式异常' });
        }

        switch (data.status) {
            case 200:
                return data;
            case 401:
                handleTokenExpired();
                return Promise.reject(data);
            case 202:
            case 500:
            default:
                return Promise.reject(data);
        }
    },
    (error) => {
        // 网络错误处理
        if (error.code === 'ECONNABORTED') {
            return Promise.reject({ msg: '请求超时，请稍后重试' });
        }
        if (!error.response) {
            return Promise.reject({ msg: '网络连接异常' });
        }

        // 服务器返回的错误
        if (error.response.status === 401) {
            handleTokenExpired();
        }

        return Promise.reject(error.response.data || { msg: '请求发生错误' });
    },
);

// 统一处理 Token 过期
export function handleTokenExpired() {
    if (!isTokenExpiredModalShow) {
        isTokenExpiredModalShow = true;

        localStorage.removeItem('token'); // 清除过期 token

        router.push('/login').finally(() => {
            isTokenExpiredModalShow = false;
        });
    }
}
