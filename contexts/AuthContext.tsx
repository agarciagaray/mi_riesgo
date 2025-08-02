import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { AuthContextType, User, UserRegistrationData } from '../types';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('authUser');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Failed to parse auth data from localStorage", e);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        clearError();
        setIsLoading(true);
        try {
            const { user: loggedInUser, token: newToken } = await authService.login(email, password);
            setUser(loggedInUser);
            setToken(newToken);
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('authUser', JSON.stringify(loggedInUser));
        } catch (e: any) {
            setError(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, [clearError]);

    const register = useCallback(async (userData: UserRegistrationData) => {
        clearError();
        setIsLoading(true);
        try {
            const { user: newUser, token: newToken } = await authService.register(userData);
            setUser(newUser);
            setToken(newToken);
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('authUser', JSON.stringify(newUser));
        } catch (e: any) {
            setError(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, [clearError]);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        clearError();
    }, [clearError]);

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        error,
        clearError
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
