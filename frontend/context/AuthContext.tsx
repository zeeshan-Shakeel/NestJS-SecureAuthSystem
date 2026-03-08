// frontend/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { LoginValues, RegisterValues } from '@/lib/schemas';

interface User {
    id: number;
    email: string;
    name?: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginValues) => Promise<void>;
    register: (data: RegisterValues) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is already logged in (optional: implement /me endpoint for session persistence)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            // Ideally verify token with backend here
            // api.get('/auth/profile').then(res => setUser(res.data)).catch(() => logout());
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (data: LoginValues) => {
        try {
            const response = await api.post('/auth/signIn', data);
            const { accessToken, user } = response.data; // Adjust based on actual API response

            if (typeof window !== 'undefined') {
                localStorage.setItem('token', accessToken);
            }
            // If backend returns user object, set it. Otherwise fetch profile.
            // setUser(user); 

            toast.success('Logged in successfully');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const register = async (data: RegisterValues) => {
        try {
            console.log("Registration Data", data);
            const response = await api.post('/auth/register', data);
            console.log("Registration successful!", response.data);
            toast.success('Registration successful! Please login.');
            // router.push('/login');
        } catch (error: any) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        setUser(null);
        router.push('/login');
        toast.success('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
