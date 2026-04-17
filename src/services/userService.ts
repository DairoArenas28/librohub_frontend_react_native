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

  async uploadAvatar(fileUri: string): Promise<User> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const fileName = fileUri.split('/').pop() ?? 'avatar.jpg';
      const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const formData = new FormData();
      formData.append('avatar', { uri: fileUri, name: fileName, type: mimeType } as any);
      const response = await fetch(`${BASE_URL}/users/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      return handleResponse<User>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async getAvatarBase64(userId: string): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const url = `${BASE_URL}/users/${userId}/avatar/base64`;
      console.log('[getAvatarBase64] fetching:', url);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[getAvatarBase64] status:', response.status);
      if (response.status === 404) return null;
      const data = await response.json();
      console.log('[getAvatarBase64] keys:', Object.keys(data), 'base64 length:', data.base64?.length);
      return data.base64 ?? null;
    } catch (err) {
      console.error('[getAvatarBase64] error:', err);
      return null;
    }
  },

  getAvatarUrl(userId: string): string {
    return `${BASE_URL}/users/${userId}/avatar`;
  },
};
