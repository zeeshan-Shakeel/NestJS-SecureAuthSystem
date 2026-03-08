'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500 text-sm">Loading...</p>
            </div>
        );
    }

    if (!user) return null; // will redirect

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-6">
            <div className="bg-white rounded-2xl shadow-md p-10 flex flex-col items-center gap-4 w-full max-w-sm">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user.name?.charAt(0).toUpperCase() ?? '?'}
                </div>

                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Welcome, {user.name}!
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                    {user.role && (
                        <span className="mt-2 inline-block text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {user.role}
                        </span>
                    )}
                </div>

                <button
                    onClick={logout}
                    className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
