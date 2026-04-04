import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
});

// Request interceptor — no longer need to manually attach tokens (handled by cookies)
api.interceptors.request.use((config) => {
    return config;
});

// Response interceptor — handle 401 with silent token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 and avoid infinite retry loop
        if (
            typeof window !== 'undefined' &&
            error.response?.status === 401 &&
            !originalRequest._retry  // prevent infinite loop
        ) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint — backend reads refreshToken from HttpOnly cookie
                await axios.post(
                    process.env.NEXT_PUBLIC_API_URL + '/auth/refresh',
                    {},
                    { withCredentials: true }
                );

                // If successful, the backend has set new cookies. RETRY the original request.
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh token is also expired or invalid → force logout
                localStorage.removeItem('user'); // Clear user cache
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
