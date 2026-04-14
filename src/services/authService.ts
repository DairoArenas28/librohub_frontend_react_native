import * as SecureStore from 'expo-secure-store';
import { AuthResponse, LoginCredentials, RegisterData } from '../types/auth';
import { handleResponse, parseError } from './errorHandler';

const BASE_URL = 'http://192.168.1.14:3000/api/v1';
const TOKEN_KEY = 'auth_token';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await handleResponse<AuthResponse>(response);
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      return data;
    } catch (err) {
      throw parseError(err);
    }
  },

  async register(data: RegisterData): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      await handleResponse<void>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async sendResetCode(email: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      await handleResponse<void>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async validateCode(email: string, code: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/auth/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      await handleResponse<void>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      await handleResponse<void>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const response = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      await handleResponse<void>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
};
