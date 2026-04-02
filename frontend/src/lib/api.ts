const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BASE_URL = isLocalhost ? (import.meta.env.VITE_API_URL || 'http://localhost:8000') : '';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

import { supabase } from './supabase';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    let token: string | undefined;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token;
    } catch (e: any) {
        if (e?.name !== 'AbortError' && !e?.message?.includes('AbortError')) {
            console.warn('API getSession error:', e);
        }
    }

    // Check if headers is an instance of Headers or a plain object
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    // Merge passed headers
    if (options.headers) {
        if (options.headers instanceof Headers) {
            options.headers.forEach((value, key) => {
                headers[key] = value;
            });
        } else if (Array.isArray(options.headers)) {
            options.headers.forEach(([key, value]) => {
                headers[key] = value;
            });
        } else {
            Object.assign(headers, options.headers);
        }
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            const text = await response.text();
            if (!response.ok) {
                return { success: false, message: response.statusText || 'An error occurred' };
            }
            try {
                data = JSON.parse(text);
            } catch {
                // ignore
            }
        }

        if (response.ok) {
            return { success: true, data: data as T };
        } else {
            return { success: false, message: (data && data.message) || response.statusText || 'An error occurred' };
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error';
        const friendly = message.includes('Failed to fetch') || message.includes('NetworkError')
            ? `Backend unreachable at ${BASE_URL}. Is the API running?`
            : message;
        return { success: false, message: friendly };
    }
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
