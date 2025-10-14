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
    const response = await apiClient.get<any>('/users', { params });
    // Le backend retourne { data: [], meta: { total, page, limit, totalPages } }
    const backendData = response.data;

    // Adapter au format attendu par le frontend
    return {
      data: backendData.data || [],
      total: backendData.meta?.total || 0,
      page: backendData.meta?.page || 1,
      limit: backendData.meta?.limit || 20,
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
