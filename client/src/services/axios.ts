import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'client_auth_token';
const REFRESH_TOKEN_KEY = 'client_refresh_token';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Returns full AxiosResponse object
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data.data;

          Cookies.set(TOKEN_KEY, token, { expires: 7 });
          Cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, { expires: 7 });

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          Cookies.remove(TOKEN_KEY);
          Cookies.remove(REFRESH_TOKEN_KEY);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
    }

    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
export { TOKEN_KEY, REFRESH_TOKEN_KEY };
