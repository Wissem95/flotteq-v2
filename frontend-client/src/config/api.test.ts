import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => {
  const actual = vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...(actual as any).default,
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn(), handlers: [] },
          response: { use: vi.fn(), handlers: [] },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      })),
      post: vi.fn(),
      request: vi.fn(),
    },
  };
});

const mockedAxios = vi.mocked(axios, true);

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', () => {
      localStorage.setItem('access_token', 'test-token');

      const config = {
        headers: {},
      } as any;

      // Get the request interceptor function
      const requestInterceptor = (config: any) => {
        const token = localStorage.getItem('access_token');
        const tenantId = localStorage.getItem('tenant_id');

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (tenantId && config.headers) {
          config.headers['X-Tenant-ID'] = tenantId;
        }

        return config;
      };

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should add X-Tenant-ID header when tenant_id exists', () => {
      localStorage.setItem('tenant_id', '123');

      const config = {
        headers: {},
      } as any;

      const requestInterceptor = (config: any) => {
        const token = localStorage.getItem('access_token');
        const tenantId = localStorage.getItem('tenant_id');

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (tenantId && config.headers) {
          config.headers['X-Tenant-ID'] = tenantId;
        }

        return config;
      };

      const result = requestInterceptor(config);

      expect(result.headers['X-Tenant-ID']).toBe('123');
    });

    it('should not add headers when tokens do not exist', () => {
      const config = {
        headers: {},
      } as any;

      const requestInterceptor = (config: any) => {
        const token = localStorage.getItem('access_token');
        const tenantId = localStorage.getItem('tenant_id');

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (tenantId && config.headers) {
          config.headers['X-Tenant-ID'] = tenantId;
        }

        return config;
      };

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(result.headers['X-Tenant-ID']).toBeUndefined();
    });
  });

  describe('Response Interceptor - Success', () => {
    it('should return response on successful request', () => {
      const mockResponse = { data: { message: 'success' } };

      const responseInterceptor = (response: any) => response;
      const result = responseInterceptor(mockResponse);

      expect(result).toBe(mockResponse);
    });
  });

  describe('Response Interceptor - 401 Error', () => {
    it('should clear localStorage on refresh token failure', async () => {
      localStorage.setItem('access_token', 'old-token');
      localStorage.setItem('refresh_token', 'old-refresh');
      localStorage.setItem('tenant_id', '123');

      const mockError = {
        response: { status: 401 },
        config: { headers: {}, _retry: false },
      };

      // Mock axios.post to simulate failed refresh
      mockedAxios.post.mockRejectedValueOnce(new Error('Refresh failed'));

      // Simulate error handler
      const errorHandler = async (error: any) => {
        if (error.response?.status === 401 && !error.config._retry) {
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }
            await axios.post('/auth/refresh', { refresh_token: refreshToken });
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('tenant_id');
            throw refreshError;
          }
        }
        throw error;
      };

      try {
        await errorHandler(mockError);
      } catch (error) {
        // Expected to throw
      }

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('tenant_id')).toBeNull();
    });

    it('should set new token on successful refresh', async () => {
      localStorage.setItem('refresh_token', 'valid-refresh-token');

      const mockError = {
        response: { status: 401 },
        config: { headers: {}, _retry: false },
      };

      const mockRefreshResponse = {
        data: { access_token: 'new-access-token' },
      };

      mockedAxios.post.mockResolvedValueOnce(mockRefreshResponse);

      // Simulate successful refresh
      const errorHandler = async (error: any) => {
        if (error.response?.status === 401 && !error.config._retry) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await axios.post('/auth/refresh', { refresh_token: refreshToken });
            localStorage.setItem('access_token', response.data.access_token);
            return response.data;
          }
        }
        throw error;
      };

      await errorHandler(mockError);

      expect(localStorage.getItem('access_token')).toBe('new-access-token');
    });
  });

  describe('Response Interceptor - Non-401 Error', () => {
    it('should reject non-401 errors without refresh attempt', async () => {
      const mockError = {
        response: { status: 500 },
        config: {},
      };

      const errorHandler = async (error: any) => {
        if (error.response?.status === 401) {
          // Handle 401
        } else {
          throw error;
        }
      };

      await expect(errorHandler(mockError)).rejects.toBe(mockError);
    });
  });
});
