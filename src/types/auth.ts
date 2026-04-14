export type UserRole = 'reader' | 'admin';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
  userId: string;
}

export interface RegisterData {
  name: string;
  document: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthState {
  token: string | null;
  role: UserRole | null;
  userId: string | null;
  isLoading: boolean;
}
