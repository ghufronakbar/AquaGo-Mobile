import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChangePasswordDTO,
  OrderDTO,
  OrderItemDTO,
  UpdateProfileDTO,
} from '@/models/Dto';
import { Api, ImageResponse } from '@/models/Api';
import { Order, Overview, Product, User } from '@/models/Entity';

export const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
export const USER_KEY = 'USER';

const API_BASE_URL = 'https://aquago.vercel.app/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error instanceof AxiosError) {
      console.log(error.response?.data || error?.message);
      if (error.response?.status === 401) {
        // Token expired or invalid
        await AsyncStorage.clear();
        // Redirect to login - you might want to use a navigation service here
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// API service methods
export const productService = {
  getAll: () => api.get<Api<Product[]>>('/user/products'),
  getById: (id: string) => api.get<Api<Product>>(`/user/products/${id}`),
};

export const orderService = {
  getAll: () => api.get<Api<Order[]>>('/user/orders'),
  getById: (id: string) => api.get<Api<Order>>(`/user/orders/${id}`),
  create: (orderData: OrderDTO) =>
    api.post<Api<Order>>('/user/orders', orderData),
  markCompleted: (id: string) => api.patch<Api<Order>>(`/user/orders/${id}`),
  cancel: (id: string) => api.delete<Api<Order>>(`/user/orders/${id}`),
};

export const userService = {
  getProfile: () => api.get<Api<User>>('/user/account'),
  updateProfile: (data: UpdateProfileDTO) =>
    api.put<Api<User>>('/user/account', data),
  changePassword: (data: ChangePasswordDTO) =>
    api.patch<Api>('/user/account', data),
  getDashboard: () => api.get<Api<Overview>>('/user/dashboard'),
};

export const imageService = {
  upload: (formData: FormData) => {
    return api.post<Api<ImageResponse>>('/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
