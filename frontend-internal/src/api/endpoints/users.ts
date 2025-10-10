import { apiClient } from '../httpClient';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UsersListResponse,
  UsersQueryParams,
} from '../types/user.types';

export const usersApi = {
  getAll: async (params?: UsersQueryParams): Promise<UsersListResponse> => {
    const response = await apiClient.get<User[]>('/users');
    // Le backend retourne un array directement pour users (pas de pagination)
    const data = Array.isArray(response.data) ? response.data : [];
    return {
      data,
      total: data.length,
      page: params?.page || 1,
      limit: params?.limit || 20,
    };
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  activate: async (id: string): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: string): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}/deactivate`);
    return response.data;
  },

  getStats: async (): Promise<any> => {
    const response = await apiClient.get('/users/stats');
    return response.data;
  },
};
