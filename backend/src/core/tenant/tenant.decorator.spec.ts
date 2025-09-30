import { ExecutionContext } from '@nestjs/common';
import { TenantId, CurrentTenant, TenantContext } from './tenant.decorator';

describe('Tenant Decorators', () => {
  const createMockExecutionContext = (tenantId?: string, tenant?: any): ExecutionContext => {
    const mockRequest = {
      tenantId,
      tenant,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  // Helper function to test parameter decorators
  const testParameterDecorator = (decorator: any, context: ExecutionContext) => {
    // Decorators return a function that can be called with (data, context)
    const decoratorFunction = decorator();
    return decoratorFunction(undefined, context);
  };

  describe('TenantId', () => {
    it('should extract tenant ID from request', () => {
      const context = createMockExecutionContext('123');

      const result = (TenantId as any)(null, context);

      expect(result).toBe('123');
    });

    it('should return undefined when tenant ID is not present', () => {
      const context = createMockExecutionContext();

      const result = (TenantId as any)(null, context);

      expect(result).toBeUndefined();
    });

    it('should extract string tenant ID', () => {
      const context = createMockExecutionContext('456');

      const result = (TenantId as any)(null, context);

      expect(result).toBe('456');
      expect(typeof result).toBe('string');
    });

    it('should handle empty string tenant ID', () => {
      const context = createMockExecutionContext('');

      const result = (TenantId as any)(null, context);

      expect(result).toBe('');
    });
  });

  describe('CurrentTenant', () => {
    it('should extract tenant object from request', () => {
      const mockTenant = {
        id: 123,
        name: 'Test Tenant',
        status: 'ACTIVE'
      };
      const context = createMockExecutionContext('123', mockTenant);

      const result = (CurrentTenant as any)(null, context);

      expect(result).toEqual(mockTenant);
    });

    it('should return undefined when tenant object is not present', () => {
      const context = createMockExecutionContext('123');

      const result = (CurrentTenant as any)(null, context);

      expect(result).toBeUndefined();
    });

    it('should return null when tenant is explicitly null', () => {
      const context = createMockExecutionContext('123', null);

      const result = (CurrentTenant as any)(null, context);

      expect(result).toBeNull();
    });

    it('should handle complex tenant object', () => {
      const mockTenant = {
        id: 456,
        name: 'Complex Tenant',
        status: 'ACTIVE',
        settings: {
          theme: 'dark',
          locale: 'en-US'
        },
        createdAt: new Date('2025-01-01'),
        permissions: ['read', 'write', 'admin']
      };
      const context = createMockExecutionContext('456', mockTenant);

      const result = (CurrentTenant as any)(null, context);

      expect(result).toEqual(mockTenant);
      expect(result.settings).toEqual({ theme: 'dark', locale: 'en-US' });
      expect(result.permissions).toEqual(['read', 'write', 'admin']);
    });
  });

  describe('TenantContext', () => {
    it('should extract both tenant ID and tenant object', () => {
      const mockTenant = {
        id: 789,
        name: 'Context Tenant',
        status: 'ACTIVE'
      };
      const context = createMockExecutionContext('789', mockTenant);

      const result = (TenantContext as any)(null, context);

      expect(result).toEqual({
        tenantId: '789',
        tenant: mockTenant,
      });
    });

    it('should handle tenant ID without tenant object', () => {
      const context = createMockExecutionContext('999');

      const result = (TenantContext as any)(null, context);

      expect(result).toEqual({
        tenantId: '999',
        tenant: undefined,
      });
    });

    it('should handle missing tenant ID and tenant object', () => {
      const context = createMockExecutionContext();

      const result = (TenantContext as any)(null, context);

      expect(result).toEqual({
        tenantId: undefined,
        tenant: undefined,
      });
    });

    it('should handle tenant object without tenant ID', () => {
      const mockTenant = {
        id: 101,
        name: 'Orphan Tenant'
      };
      const context = createMockExecutionContext(undefined, mockTenant);

      const result = (TenantContext as any)(null, context);

      expect(result).toEqual({
        tenantId: undefined,
        tenant: mockTenant,
      });
    });

    it('should preserve all tenant object properties', () => {
      const mockTenant = {
        id: 202,
        name: 'Full Context Tenant',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00.000Z',
        metadata: {
          subscription: 'premium',
          features: ['feature1', 'feature2']
        }
      };
      const context = createMockExecutionContext('202', mockTenant);

      const result = (TenantContext as any)(null, context);

      expect(result.tenantId).toBe('202');
      expect(result.tenant).toEqual(mockTenant);
      expect(result.tenant.metadata.subscription).toBe('premium');
      expect(result.tenant.metadata.features).toEqual(['feature1', 'feature2']);
    });

    it('should handle null tenant explicitly', () => {
      const context = createMockExecutionContext('303', null);

      const result = (TenantContext as any)(null, context);

      expect(result).toEqual({
        tenantId: '303',
        tenant: null,
      });
    });
  });

  describe('Decorator Integration', () => {
    it('should work with all decorators on same request', () => {
      const mockTenant = {
        id: 404,
        name: 'Integration Tenant',
        status: 'ACTIVE'
      };
      const context = createMockExecutionContext('404', mockTenant);

      const tenantId = (TenantId as any)(null, context);
      const tenant = (CurrentTenant as any)(null, context);
      const tenantContext = (TenantContext as any)(null, context);

      expect(tenantId).toBe('404');
      expect(tenant).toEqual(mockTenant);
      expect(tenantContext).toEqual({
        tenantId: '404',
        tenant: mockTenant,
      });
    });

    it('should maintain consistency across decorators', () => {
      const context = createMockExecutionContext('505');

      const tenantId = (TenantId as any)(null, context);
      const tenant = (CurrentTenant as any)(null, context);
      const tenantContext = (TenantContext as any)(null, context);

      expect(tenantId).toBe('505');
      expect(tenant).toBeUndefined();
      expect(tenantContext.tenantId).toBe('505');
      expect(tenantContext.tenant).toBeUndefined();
    });
  });
});