export interface UpdateProfileDTO {
  email: string;
  name: string;
  picture: string | null;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

export interface OrderDTO {
  latitude: number;
  longitude: number;
  location: string;
  orderItems: OrderItemDTO[];
}

export interface OrderItemDTO {
  productId: string;
  quantity: number;
}

// Inisiasi Kosong

export const initUpdateProfile: UpdateProfileDTO = {
  email: '',
  name: '',
  picture: null,
};

export const initChangePassword: ChangePasswordDTO = {
  oldPassword: '',
  newPassword: '',
};

export const initOrder: OrderDTO = {
  latitude: 0,
  longitude: 0,
  location: '',
  orderItems: [],
};
