import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        try {
          await authService.getProfile();
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    if (response.user) {
      setUser(response.user);
      if (response.token) {
        setToken(response.token);
        localStorage.setItem('token', response.token);
      }
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
