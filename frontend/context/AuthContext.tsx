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

    // Check auth status on page load/mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Try fetching the profile. If it works, the user is still logged in (cookies sent automatically)
                const response = await api.get('/auth/profile');
                setUser(response.data);
                // Also cache the user object for UI "flash" prevention on next load
                localStorage.setItem('user', JSON.stringify(response.data));
            } catch (error) {
                // Failed to fetch profile -> not logged in or session expired
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        // Try to load cached user first for immediate UI feedback
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    localStorage.removeItem('user');
                }
            }
        }

        checkAuth();
    }, []);

    const login = async (data: LoginValues) => {
        try {
            // Backend sets HttpOnly cookies (accessToken, refreshToken)
            const response = await api.post('/auth/signIn', data);
            const loggedInUser = response.data.user;

            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(loggedInUser));
            }
            setUser(loggedInUser);

            toast.success('Logged in successfully');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const register = async (data: RegisterValues) => {
        try {
            // Backend sets cookies even on registration (if configured to auto-login)
            // but here we follow the existing flow: Register -> Login
            await api.post('/auth/register', data);
            toast.success('Registration successful! Please login.');
            router.push('/login');
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Call backend to clear HttpOnly cookies
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
            }
            setUser(null);
            router.push('/login');
            toast.success('Logged out');
        }
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
