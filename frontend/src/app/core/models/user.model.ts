export interface Address {
  _id?: string;
  address: string;
  governorate: string;
  city: string;
  area?: string;
  buildingDetails?: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  mobilePhone: string;
  nationalId?: string;
  gender: 'male' | 'female';
  role: 'user' | 'admin';
  dateOfBirth?: string;
  addresses: Address[];
  isBlocked?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isBlocked?: boolean | string;
  sortBy?: string;
  order?: 'asc' | 'desc' | string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  guestCart?: { productId: string; quantity: number }[];
}

export interface RegisterRequest {
  name: string;
  email: string;
  mobilePhone: string;
  password: string;
  gender: 'male' | 'female';
  dateOfBirth?: string;
  nationalId?: string;
  guestCart?: { productId: string; quantity: number }[];
}
