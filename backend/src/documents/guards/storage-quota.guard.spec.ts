import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, PayloadTooLargeException } from '@nestjs/common';
import { StorageQuotaGuard } from './storage-quota.guard';
import { DocumentsService } from '../documents.service';
import { TenantsService } from '../../modules/tenants/tenants.service';
import { Tenant } from '../../entities/tenant.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';

describe('StorageQuotaGuard', () => {
  let guard: StorageQuotaGuard;
  let documentsService: jest.Mocked<DocumentsService>;
  let tenantsService: jest.Mocked<TenantsService>;

  const mockPlan: Partial<SubscriptionPlan> = {
    id: 1,
    name: 'Standard',
    maxStorageMb: 100,
  };

  const mockTenant: Partial<Tenant> = {
    id: 1,
    name: 'Test Tenant',
    plan: mockPlan as SubscriptionPlan,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageQuotaGuard,
        {
          provide: DocumentsService,
          useValue: {
            getTenantStorageUsage: jest.fn(),
          },
        },
        {
          provide: TenantsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<StorageQuotaGuard>(StorageQuotaGuard);
    documentsService = module.get(DocumentsService) as jest.Mocked<DocumentsService>;
    tenantsService = module.get(TenantsService) as jest.Mocked<TenantsService>;
  });

  const createMockContext = (file: any, user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          file,
          user,
        }),
      }),
    } as any;
  };

  describe('canActivate', () => {
    it('should allow upload when under quota', async () => {
      const mockContext = createMockContext(
        { size: 1024 * 1024 }, // 1MB file
        { tenantId: 1 }
      );

      documentsService.getTenantStorageUsage.mockResolvedValue(50 * 1024 * 1024); // 50MB used
      tenantsService.findOne.mockResolvedValue(mockTenant as Tenant);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(documentsService.getTenantStorageUsage).toHaveBeenCalledWith(1);
      expect(tenantsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should block upload when quota exceeded', async () => {
      const mockContext = createMockContext(
        { size: 60 * 1024 * 1024 }, // 60MB file
        { tenantId: 1 }
      );

      documentsService.getTenantStorageUsage.mockResolvedValue(50 * 1024 * 1024); // 50MB used
      tenantsService.findOne.mockResolvedValue(mockTenant as Tenant);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(PayloadTooLargeException);
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        /Quota de stockage dépassé/
      );
    });

    it('should return true if no file in request', async () => {
      const mockContext = createMockContext(
        null, // No file
        { tenantId: 1 }
      );

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(documentsService.getTenantStorageUsage).not.toHaveBeenCalled();
      expect(tenantsService.findOne).not.toHaveBeenCalled();
    });

    it('should throw when tenant ID is missing', async () => {
      const mockContext = createMockContext(
        { size: 1024 }, // 1KB file
        {} // No tenantId
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(PayloadTooLargeException);
      await expect(guard.canActivate(mockContext)).rejects.toThrow('Tenant ID manquant');
    });

    it('should throw when tenant is not found', async () => {
      const mockContext = createMockContext(
        { size: 1024 },
        { tenantId: 999 }
      );

      documentsService.getTenantStorageUsage.mockResolvedValue(0);
      tenantsService.findOne.mockResolvedValue(undefined as any);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(PayloadTooLargeException);
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        /Plan d'abonnement introuvable/
      );
    });

    it('should throw when tenant has no plan', async () => {
      const mockContext = createMockContext(
        { size: 1024 },
        { tenantId: 1 }
      );

      const tenantWithoutPlan = { ...mockTenant, plan: undefined };

      documentsService.getTenantStorageUsage.mockResolvedValue(0);
      tenantsService.findOne.mockResolvedValue(tenantWithoutPlan as any);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(PayloadTooLargeException);
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        /Plan d'abonnement introuvable/
      );
    });

    it('should allow upload when exactly at quota limit', async () => {
      const mockContext = createMockContext(
        { size: 50 * 1024 * 1024 }, // 50MB file
        { tenantId: 1 }
      );

      documentsService.getTenantStorageUsage.mockResolvedValue(50 * 1024 * 1024); // 50MB used
      tenantsService.findOne.mockResolvedValue(mockTenant as Tenant);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should block upload when exceeding quota by 1 byte', async () => {
      const mockContext = createMockContext(
        { size: 50 * 1024 * 1024 + 1 }, // 50MB + 1 byte
        { tenantId: 1 }
      );

      documentsService.getTenantStorageUsage.mockResolvedValue(50 * 1024 * 1024); // 50MB used
      tenantsService.findOne.mockResolvedValue(mockTenant as Tenant);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(PayloadTooLargeException);
    });

    it('should include usage details in error message', async () => {
      const mockContext = createMockContext(
        { size: 60 * 1024 * 1024 }, // 60MB file
        { tenantId: 1 }
      );

      documentsService.getTenantStorageUsage.mockResolvedValue(50 * 1024 * 1024); // 50MB used
      tenantsService.findOne.mockResolvedValue(mockTenant as Tenant);

      try {
        await guard.canActivate(mockContext);
        fail('Should have thrown PayloadTooLargeException');
      } catch (error) {
        expect(error).toBeInstanceOf(PayloadTooLargeException);
        expect(error.message).toContain('50.00MB');
        expect(error.message).toContain('100MB');
        expect(error.message).toContain('60.00MB');
      }
    });

    it('should handle zero storage usage', async () => {
      const mockContext = createMockContext(
        { size: 1024 * 1024 }, // 1MB file
        { tenantId: 1 }
      );

      documentsService.getTenantStorageUsage.mockResolvedValue(0); // No usage
      tenantsService.findOne.mockResolvedValue(mockTenant as Tenant);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });
});
