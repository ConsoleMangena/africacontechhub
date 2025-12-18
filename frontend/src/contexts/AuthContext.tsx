import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';

export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    profile: {
        role: 'BUILDER' | 'CONTRACTOR' | 'SUPPLIER';
        phone_number?: string;
        avatar?: string | null;
    };
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<{ error: Error | null; user: User | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null; user: User | null }>;
    signOut: () => Promise<void>;
}

interface SignUpMetadata {
    first_name?: string;
    last_name?: string;
    role?: 'BUILDER' | 'CONTRACTOR' | 'SUPPLIER';
    phone_number?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setLoading(false);
            return;
        }

        const response = await api.get<User>('/auth/me/');
        if (response.success && response.data) {
            setUser(response.data);
        } else {
            // Invalid token
            localStorage.removeItem('auth_token');
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const signUp = async (email: string, password: string, metadata?: SignUpMetadata) => {
        try {
            const response = await api.post<{ token: string; user_id: number; email: string; role: string }>('/auth/register/', {
                email,
                password,
                first_name: metadata?.first_name,
                last_name: metadata?.last_name,
                role: metadata?.role,
                phone_number: metadata?.phone_number
            });

            if (response.success && response.data) {
                localStorage.setItem('auth_token', response.data.token);
                await checkAuth();
                // Return the user after checkAuth updates the state
                const currentUser = await api.get<User>('/auth/me/');
                return { error: null, user: currentUser.data || null };
            } else {
                return { error: new Error(response.message || 'Registration failed'), user: null };
            }
        } catch (err) {
            console.error('Sign up error:', err);
            return { error: new Error('Registration failed'), user: null };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            console.log('[AuthContext] signIn called with:', email);
            const response = await api.post<{ token: string }>('/auth/login/', {
                email,
                password,
            });
            console.log('[AuthContext] login response:', response);

            if (response.success && response.data) {
                localStorage.setItem('auth_token', response.data.token);
                console.log('[AuthContext] token stored, fetching user...');
                await checkAuth();
                // Fetch user data after setting the token
                const userResponse = await api.get<User>('/auth/me/');
                console.log('[AuthContext] user response:', userResponse);
                const userData = userResponse.data || null;
                console.log('[AuthContext] returning user:', userData);
                return { error: null, user: userData };
            } else {
                console.log('[AuthContext] login failed:', response.message);
                return { error: new Error(response.message || 'Login failed'), user: null };
            }
        } catch (err) {
            console.error('[AuthContext] Sign in error:', err);
            return { error: new Error('Login failed'), user: null };
        }
    };

    const signOut = async () => {
        localStorage.removeItem('auth_token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
