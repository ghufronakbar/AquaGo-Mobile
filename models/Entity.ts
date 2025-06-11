export type Role = 'Admin' | 'User' | 'Seller';

export type StatusOrder =
  | 'Pending'
  | 'Dibayar'
  | 'Dikirim'
  | 'Selesai'
  | 'Dibatalkan';
export type TransactionType = 'Pencairan' | 'Pemasukan';

export interface User {
  id: string;
  name: string;
  role: Role;
  picture?: string | null;
  email: string;
  password: string;
  products: Product[];
  orders: Order[];
  transactions: Transaction[];
  accessToken: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
  images: string[];
  user: User;
  userId: string;
  orderItems: OrderItem[];
  isDeleted: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Order {
  id: string;
  total: number;
  status: StatusOrder;
  latitude: number;
  longitude: number;
  location: string;
  mtSnapToken?: string | null;
  mtRedirectUrl?: string | null;
  user: User;
  userId: string;
  orderItems: OrderItem[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface OrderItem {
  id: string;
  quantity: number;
  pricePerItem: number;
  total: number;
  orderId: string;
  order: Order;
  productId: string;
  product: Product;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  userId: string;
  user: User;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
