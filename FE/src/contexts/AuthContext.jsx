import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Decode JWT token to extract payload
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));

            // Decode token to get role
            const decoded = decodeToken(token);
            // Check for role claim (standard or Microsoft specific)
            const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'];
            if (role) {
                setUserRole(role);
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await authApi.login({ username, password });
            const { token, user } = response;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);

            // Decode token to get role
            const decoded = decodeToken(token);
            const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'];
            if (role) {
                setUserRole(role);
            }

            // Redirect will be handled by the component or router
            return { success: true, role: role };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authApi.register(userData);
            const { token, user } = response;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);

            // Decode token to get role
            const decoded = decodeToken(token);
            const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'];
            if (role) {
                setUserRole(role);
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setUserRole(null);
        window.location.href = '/login';
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin: userRole === 'Admin',
        userRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
