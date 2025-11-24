import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import * as request from 'supertest';
import { TenantId, CurrentTenant, TenantContext } from './tenant.decorator';

// Controller de test qui utilise vraiment les décorateurs
@Controller('test-decorators')
class TestDecoratorController {
  @Get('tenant-id')
  getTenantId(@TenantId() tenantId: string) {
    return { tenantId };
  }

  @Get('current-tenant')
  getCurrentTenant(@CurrentTenant() tenant: any) {
    return { tenant };
  }

  @Get('tenant-context')
  getTenantContext(@TenantContext() context: any) {
    return { context };
  }

  @Get('all-decorators')
  getAllDecorators(
    @TenantId() tenantId: string,
    @CurrentTenant() tenant: any,
    @TenantContext() context: any,
  ) {
    return { tenantId, tenant, context };
  }
}

describe('Tenant Decorators Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [TestDecoratorController],
    }).compile();

    app = moduleRef.createNestApplication();

    // Middleware simulé pour ajouter tenantId et tenant à la request
    app.use((req: any, res: any, next: any) => {
      if (req.headers['x-tenant-id']) {
        req['tenantId'] = req.headers['x-tenant-id'];
      }
      if (req.headers['x-tenant-data']) {
        try {
          req['tenant'] = JSON.parse(req.headers['x-tenant-data']);
        } catch (error) {
          return res.status(400).json({ error: 'Invalid tenant data' });
        }
      }
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('@TenantId()', () => {
    it('should extract tenant ID from request', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-decorators/tenant-id')
        .set('X-Tenant-ID', '123')
        .expect(200);

      expect(response.body).toEqual({ tenantId: '123' });
    });

    it('should return undefined when tenant ID is not present', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-decorators/tenant-id')
        .expect(200);

      expect(response.body).toEqual({ tenantId: undefined });
    });

    it('should handle different tenant ID formats', async () => {
      // Numeric string
      let response = await request(app.getHttpServer())
        .get('/test-decorators/tenant-id')
        .set('X-Tenant-ID', '456')
        .expect(200);
      expect(response.body.tenantId).toBe('456');

      // UUID format
      response = await request(app.getHttpServer())
        .get('/test-decorators/tenant-id')
        .set('X-Tenant-ID', 'abc-123-def')
        .expect(200);
      expect(response.body.tenantId).toBe('abc-123-def');
    });
  });

  describe('@CurrentTenant()', () => {
    it('should extract tenant object from request', async () => {
      const tenantData = {
        id: 1,
        name: 'Test Company',
        plan: 'premium',
      };

      const response = await request(app.getHttpServer())
        .get('/test-decorators/current-tenant')
        .set('X-Tenant-Data', JSON.stringify(tenantData))
        .expect(200);

      expect(response.body).toEqual({ tenant: tenantData });
    });

    it('should return undefined when tenant object is not present', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-decorators/current-tenant')
        .expect(200);

      expect(response.body).toEqual({ tenant: undefined });
    });

    it('should handle complex tenant objects', async () => {
      const complexTenant = {
        id: 2,
        name: 'Complex Corp',
        settings: {
          theme: 'dark',
          language: 'fr',
        },
        users: [{ id: 1, name: 'Admin' }],
      };

      const response = await request(app.getHttpServer())
        .get('/test-decorators/current-tenant')
        .set('X-Tenant-Data', JSON.stringify(complexTenant))
        .expect(200);

      expect(response.body.tenant).toEqual(complexTenant);
    });
  });

  describe('@TenantContext()', () => {
    it('should extract both tenant ID and tenant object', async () => {
      const tenantData = {
        id: 3,
        name: 'Context Company',
      };

      const response = await request(app.getHttpServer())
        .get('/test-decorators/tenant-context')
        .set('X-Tenant-ID', '3')
        .set('X-Tenant-Data', JSON.stringify(tenantData))
        .expect(200);

      expect(response.body.context).toEqual({
        tenantId: '3',
        tenant: tenantData,
      });
    });

    it('should handle partial context (only tenant ID)', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-decorators/tenant-context')
        .set('X-Tenant-ID', '4')
        .expect(200);

      expect(response.body.context).toEqual({
        tenantId: '4',
        tenant: undefined,
      });
    });

    it('should handle empty context', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-decorators/tenant-context')
        .expect(200);

      expect(response.body.context).toEqual({
        tenantId: undefined,
        tenant: undefined,
      });
    });
  });

  describe('Multiple decorators together', () => {
    it('should work with all decorators on same endpoint', async () => {
      const tenantData = {
        id: 5,
        name: 'Multi Company',
        active: true,
      };

      const response = await request(app.getHttpServer())
        .get('/test-decorators/all-decorators')
        .set('X-Tenant-ID', '5')
        .set('X-Tenant-Data', JSON.stringify(tenantData))
        .expect(200);

      expect(response.body).toEqual({
        tenantId: '5',
        tenant: tenantData,
        context: {
          tenantId: '5',
          tenant: tenantData,
        },
      });
    });

    it('should maintain consistency across all decorators', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-decorators/all-decorators')
        .set('X-Tenant-ID', '100')
        .expect(200);

      expect(response.body.tenantId).toBe('100');
      expect(response.body.context.tenantId).toBe('100');
      expect(response.body.tenant).toBeUndefined();
      expect(response.body.context.tenant).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string tenant ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-decorators/tenant-id')
        .set('X-Tenant-ID', '')
        .expect(200);

      // Empty string header results in no tenantId being set
      expect(response.body).toEqual({});
    });

    it('should handle malformed tenant data gracefully', async () => {
      // Le middleware retourne une erreur 400 Bad Request pour du JSON invalide
      const response = await request(app.getHttpServer())
        .get('/test-decorators/current-tenant')
        .set('X-Tenant-Data', 'not-json')
        .expect(400);
    });
  });
});
