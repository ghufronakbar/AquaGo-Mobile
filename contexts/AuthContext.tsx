import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ACCESS_TOKEN_KEY, api, setAuthToken } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Api } from '@/models/Api';
import { User } from '@/models/Entity';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        setAuthToken(token);
        const response = await api.get<Api<User>>('/user/account/auth');
        setUser(response.data.data);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await AsyncStorage.clear();
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<Api<User>>('/login', {
        email,
        password,
      });

      if (response.data.data.role !== 'User') {
        throw new Error('Anda bukan pengguna');
      }

      const { data } = response.data;
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      setAuthToken(data.accessToken);
      setUser(data);

      router.replace('/(tabs)');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login gagal');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post<Api<User>>('/register', {
        email,
        password,
        name,
        role: 'User',
      });

      const { data } = response.data;
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      setAuthToken(data.accessToken);
      setUser(data);

      router.replace('/(tabs)');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registrasi gagal');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      setAuthToken(null);
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
