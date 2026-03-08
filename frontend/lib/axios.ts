import axios from 'axios';


// Create an Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies/sessions
    timeout: 10000, // optional, prevents hanging requests
});

// Request interceptor (attach token if using localStorage)
api.interceptors.request.use((config) => {
    // Check if running on the client before accessing localStorage
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor (global error handling)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if running on the client
        if (typeof window !== 'undefined') {
            if (error.response?.status === 401) {
                console.log('Unauthorized! Redirecting to login...');
                // Prevent infinite loops if already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }console.log("Login Redirected");

            }
        }
        return Promise.reject(error);
    }
);

export default api;
