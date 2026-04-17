import { UserRole } from './auth';

export interface User {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  avatarPath: string | null;
}

export interface UserFormData {
  name: string;
  document: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
}

export interface DashboardStats {
  users: {
    active: number;
    inactive: number;
  };
  books: {
    active: number;
    inactive: number;
  };
}
