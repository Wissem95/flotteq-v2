import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocumentOwnershipGuard } from './document-ownership.guard';
import { DocumentsService } from '../documents.service';
import { UserRole } from '../../entities/user.entity';

describe('DocumentOwnershipGuard', () => {
  let guard: DocumentOwnershipGuard;
  let documentsService: jest.Mocked<DocumentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentOwnershipGuard,
        { provide: DocumentsService, useValue: { findOne: jest.fn() } },
        { provide: Reflector, useValue: {} },
      ],
    }).compile();

    guard = module.get(DocumentOwnershipGuard);
    documentsService = module.get(DocumentsService);
  });

  const createContext = (user: any, method: string, docId?: string): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({ user, method, params: { id: docId } }),
    }),
  } as any);

  describe('SUPER_ADMIN role', () => {
    it('should allow access to any document', async () => {
      const user = { id: 'admin', role: UserRole.SUPER_ADMIN, tenantId: 1 };
      documentsService.findOne.mockResolvedValue({ id: 'doc1', uploadedById: 'other' } as any);

      await expect(guard.canActivate(createContext(user, 'DELETE', 'doc1'))).resolves.toBe(true);
    });
  });

  describe('TENANT_ADMIN role', () => {
    it('should allow access to tenant documents', async () => {
      const user = { id: 'admin', role: UserRole.TENANT_ADMIN, tenantId: 2 };
      documentsService.findOne.mockResolvedValue({ id: 'doc1', uploadedById: 'user2', tenantId: 2 } as any);

      await expect(guard.canActivate(createContext(user, 'DELETE', 'doc1'))).resolves.toBe(true);
    });
  });

  describe('DRIVER role', () => {
    it('should allow driver to delete own document', async () => {
      const user = { id: 'driver1', role: UserRole.DRIVER, tenantId: 2 };
      documentsService.findOne.mockResolvedValue({ id: 'doc1', uploadedById: 'driver1' } as any);

      await expect(guard.canActivate(createContext(user, 'DELETE', 'doc1'))).resolves.toBe(true);
    });

    it('should forbid driver from deleting other user document', async () => {
      const user = { id: 'driver1', role: UserRole.DRIVER, tenantId: 2 };
      documentsService.findOne.mockResolvedValue({ id: 'doc1', uploadedById: 'driver2' } as any);

      await expect(guard.canActivate(createContext(user, 'DELETE', 'doc1'))).rejects.toThrow(ForbiddenException);
    });
  });

  describe('VIEWER role', () => {
    it('should allow GET requests', async () => {
      const user = { id: 'viewer', role: UserRole.VIEWER, tenantId: 2 };
      documentsService.findOne.mockResolvedValue({ id: 'doc1', uploadedById: 'viewer' } as any);

      await expect(guard.canActivate(createContext(user, 'GET', 'doc1'))).resolves.toBe(true);
    });

    it('should forbid DELETE requests', async () => {
      const user = { id: 'viewer', role: UserRole.VIEWER, tenantId: 2 };

      await expect(guard.canActivate(createContext(user, 'DELETE', 'doc1'))).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Tenant isolation', () => {
    it('should call findOne with correct tenantId', async () => {
      const user = { id: 'user1', role: UserRole.MANAGER, tenantId: 5 };
      documentsService.findOne.mockResolvedValue({ id: 'doc1', uploadedById: 'user1' } as any);

      await guard.canActivate(createContext(user, 'GET', 'doc1'));

      expect(documentsService.findOne).toHaveBeenCalledWith('doc1', 5);
    });
  });

  describe('Document not found', () => {
    it('should throw NotFoundException', async () => {
      const user = { id: 'user1', role: UserRole.MANAGER, tenantId: 2 };
      documentsService.findOne.mockRejectedValue(new NotFoundException('Document non trouvé'));

      await expect(guard.canActivate(createContext(user, 'GET', 'doc1'))).rejects.toThrow(NotFoundException);
    });
  });

  describe('POST requests', () => {
    it('should allow upload for all authenticated users', async () => {
      const user = { id: 'user1', role: UserRole.DRIVER, tenantId: 2 };

      await expect(guard.canActivate(createContext(user, 'POST'))).resolves.toBe(true);
      expect(documentsService.findOne).not.toHaveBeenCalled();
    });
  });
});
