import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Role } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: Role) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hospital_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hospital_jwt_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('hospital_user', JSON.stringify(currentUser));
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('hospital_jwt_token', res.token);
    localStorage.setItem('hospital_user', JSON.stringify(res.user));
  };

  const register = async (name: string, email: string, pass: string, role: Role) => {
    const res = await authService.register(name, email, pass, role);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('hospital_jwt_token', res.token);
    localStorage.setItem('hospital_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hospital_jwt_token');
    localStorage.removeItem('hospital_user');
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, isLoading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
