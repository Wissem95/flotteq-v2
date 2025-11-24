import { Test, TestingModule } from '@nestjs/testing';
import { TestController } from './test.controller';

describe('TestController', () => {
  let controller: TestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    controller = module.get<TestController>(TestController);
  });

  describe('getTenantInfo', () => {
    it('should return tenant information with valid tenant ID', () => {
      const tenantId = '123';
      const result = controller.getTenantInfo(tenantId);

      expect(result).toHaveProperty('tenantId', '123');
      expect(result).toHaveProperty('message', 'Multi-tenant works!');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should return tenant information with undefined tenant ID', () => {
      const result = controller.getTenantInfo(undefined);

      expect(result).toHaveProperty('tenantId', undefined);
      expect(result).toHaveProperty('message', 'Multi-tenant works!');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return tenant information with string tenant ID', () => {
      const tenantId = '456';
      const result = controller.getTenantInfo(tenantId);

      expect(result.tenantId).toBe('456');
      expect(typeof result.tenantId).toBe('string');
    });

    it('should generate valid ISO timestamp', () => {
      const result = controller.getTenantInfo('1');
      const timestamp = new Date(result.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });

  describe('getTenantContext', () => {
    it('should return tenant context with valid tenant ID', () => {
      const context = { tenantId: '789' };
      const result = controller.getTenantContext(context);

      expect(result).toHaveProperty('tenantId', '789');
      expect(result).toHaveProperty('message', 'Full tenant context retrieved');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return tenant context with tenant ID and tenant object', () => {
      const mockTenant = {
        id: 789,
        name: 'Test Tenant',
        status: 'ACTIVE',
      };
      const context = { tenantId: '789', tenant: mockTenant };
      const result = controller.getTenantContext(context);

      expect(result.tenantId).toBe('789');
      expect(result.tenant).toEqual(mockTenant);
      expect(result.message).toBe('Full tenant context retrieved');
    });

    it('should return tenant context without tenant ID', () => {
      const context = { tenantId: undefined };
      const result = controller.getTenantContext(context);

      expect(result.tenantId).toBeUndefined();
      expect(result.message).toBe('Full tenant context retrieved');
    });

    it('should preserve all context properties', () => {
      const mockTenant = {
        id: 101,
        name: 'Complex Tenant',
        settings: { theme: 'dark' },
      };
      const context = {
        tenantId: '101',
        tenant: mockTenant,
      };
      const result = controller.getTenantContext(context);

      expect(result.tenantId).toBe('101');
      expect(result.tenant).toEqual(mockTenant);
      expect(result.tenant.settings).toEqual({ theme: 'dark' });
    });
  });

  describe('getCurrentTenant', () => {
    it('should return current tenant with tenant object', () => {
      const mockTenant = {
        id: 202,
        name: 'Current Tenant',
        status: 'ACTIVE',
      };
      const tenantId = '202';

      const result = controller.getCurrentTenant(mockTenant, tenantId);

      expect(result.tenantId).toBe('202');
      expect(result.tenant).toEqual(mockTenant);
      expect(result.message).toBe('Tenant object found');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return current tenant without tenant object', () => {
      const tenantId = '303';

      const result = controller.getCurrentTenant(null, tenantId);

      expect(result.tenantId).toBe('303');
      expect(result.tenant).toBeNull();
      expect(result.message).toBe(
        'Tenant object not loaded (normal for basic setup)',
      );
    });

    it('should return current tenant with undefined tenant object', () => {
      const tenantId = '404';

      const result = controller.getCurrentTenant(undefined, tenantId);

      expect(result.tenantId).toBe('404');
      expect(result.tenant).toBeUndefined();
      expect(result.message).toBe(
        'Tenant object not loaded (normal for basic setup)',
      );
    });

    it('should handle undefined tenant ID', () => {
      const mockTenant = {
        id: 505,
        name: 'Undefined ID Tenant',
      };

      const result = controller.getCurrentTenant(mockTenant, undefined);

      expect(result.tenantId).toBeUndefined();
      expect(result.tenant).toEqual(mockTenant);
      expect(result.message).toBe('Tenant object found');
    });

    it('should return correct message based on tenant existence', () => {
      // With tenant
      const withTenant = controller.getCurrentTenant({ id: 1 }, '1');
      expect(withTenant.message).toBe('Tenant object found');

      // Without tenant (null)
      const withoutTenantNull = controller.getCurrentTenant(null, '1');
      expect(withoutTenantNull.message).toBe(
        'Tenant object not loaded (normal for basic setup)',
      );

      // Without tenant (undefined)
      const withoutTenantUndefined = controller.getCurrentTenant(
        undefined,
        '1',
      );
      expect(withoutTenantUndefined.message).toBe(
        'Tenant object not loaded (normal for basic setup)',
      );

      // Empty object (should be treated as tenant exists)
      const withEmptyTenant = controller.getCurrentTenant({}, '1');
      expect(withEmptyTenant.message).toBe('Tenant object found');
    });

    it('should handle complex tenant objects', () => {
      const complexTenant = {
        id: 606,
        name: 'Complex Tenant',
        status: 'ACTIVE',
        createdAt: new Date('2025-01-01'),
        settings: {
          theme: 'dark',
          locale: 'en-US',
          features: ['feature1', 'feature2'],
        },
        metadata: {
          subscription: 'premium',
          lastLogin: '2025-01-15T10:30:00.000Z',
        },
      };

      const result = controller.getCurrentTenant(complexTenant, '606');

      expect(result.tenant).toEqual(complexTenant);
      expect(result.tenant.settings.features).toEqual(['feature1', 'feature2']);
      expect(result.tenant.metadata.subscription).toBe('premium');
      expect(result.message).toBe('Tenant object found');
    });
  });

  describe('Controller Integration', () => {
    it('should have consistent timestamp format across methods', () => {
      const result1 = controller.getTenantInfo('1');
      const result2 = controller.getTenantContext({ tenantId: '1' });
      const result3 = controller.getCurrentTenant(null, '1');

      // All should have ISO timestamp format
      expect(result1.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(result2.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(result3.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      // All should be valid dates
      expect(new Date(result1.timestamp)).toBeInstanceOf(Date);
      expect(new Date(result2.timestamp)).toBeInstanceOf(Date);
      expect(new Date(result3.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle same tenant ID consistently', () => {
      const tenantId = '999';
      const mockTenant = { id: 999, name: 'Consistent Tenant' };

      const result1 = controller.getTenantInfo(tenantId);
      const result2 = controller.getTenantContext({
        tenantId,
        tenant: mockTenant,
      });
      const result3 = controller.getCurrentTenant(mockTenant, tenantId);

      expect(result1.tenantId).toBe('999');
      expect(result2.tenantId).toBe('999');
      expect(result3.tenantId).toBe('999');
    });
  });
});
