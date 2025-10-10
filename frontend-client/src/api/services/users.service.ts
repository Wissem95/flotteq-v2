import api from '@/config/api';
import type { User, CreateUserDto, UpdateUserDto, InviteUserDto, InvitationResponse } from '@/types/user.types';

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  invite: async (data: InviteUserDto): Promise<InvitationResponse> => {
    const response = await api.post('/users/invite', data);
    return response.data;
  },

  deactivate: async (id: string): Promise<void> => {
    await api.patch(`/users/${id}/deactivate`);
  },

  activate: async (id: string): Promise<void> => {
    await api.patch(`/users/${id}/activate`);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getStats: async (): Promise<{
    total: number;
    byRole: Record<string, number>;
    active: number;
    inactive: number;
  }> => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};
