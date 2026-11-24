export interface UserGeolocation {
  lat: string;
  long: string;
}

export interface UserAddress {
  city?: string;
  street?: string;
  number?: number;
  zipcode?: string;
  geolocation?: UserGeolocation;
}

export interface UserName {
  firstname: string;
  lastname: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  password?: string;
  passwordHash?: string;
  name: UserName;
  phone?: string;
  address?: UserAddress;
  role?: 'admin' | 'usuario';
  lastModified?: string;
  lastModifiedBy?: string;
  __v?: number;
}

export interface AuthSession {
  token: string;
  user: User;
  loginTime: string;
  expiresAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
