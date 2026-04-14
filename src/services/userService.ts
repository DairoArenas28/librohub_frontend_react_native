import * as SecureStore from 'expo-secure-store';
import { DashboardStats, User, UserFormData } from '../types/user';
import { handleResponse, parseError } from './errorHandler';
import { API_URL } from '../config';

const BASE_URL = API_URL;
const TOKEN_KEY = 'auth_token';

async function authHeaders(): Promise<HeadersInit> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const userService = {
  async getMe(): Promise<User> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/users/me`, { headers });
      return handleResponse<User>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/users`, { headers });
      return handleResponse<User[]>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async createUser(data: UserFormData): Promise<User> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return handleResponse<User>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async updateUser(id: string, data: UserFormData): Promise<User> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      return handleResponse<User>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers,
      });
      await handleResponse<void>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/dashboard/stats`, { headers });
      return handleResponse<DashboardStats>(response);
    } catch (err) {
      throw parseError(err);
    }
  },
};
