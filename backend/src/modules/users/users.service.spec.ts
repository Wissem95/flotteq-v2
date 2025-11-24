import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from '../../entities/user.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { EmailQueueService } from '../notifications/email-queue.service';
import { ForbiddenException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.TENANT_ADMIN,
    tenantId: 2,
    isActive: true,
    canManageUsers: () => true,
    canViewAllData: () => false,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockSubscriptionsService = {
    enforceLimit: jest.fn(),
    updateUsage: jest.fn(),
  };

  const mockEmailQueueService = {
    queueWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: SubscriptionsService,
          useValue: mockSubscriptionsService,
        },
        {
          provide: EmailQueueService,
          useValue: mockEmailQueueService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user when permissions are valid', async () => {
      const createDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.MANAGER,
      };

      const savedUser = { ...createDto, id: 'new-id', tenantId: 2 };

      mockRepository.findOne
        .mockResolvedValueOnce(null) // First call: check if email exists
        .mockResolvedValueOnce({
          // Second call: get user with tenant for email
          ...savedUser,
          tenant: { id: 2, name: 'Test Tenant' },
        });
      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createDto, mockUser as any);

      expect(mockSubscriptionsService.enforceLimit).toHaveBeenCalledWith(
        2,
        'users',
      );
      expect(mockSubscriptionsService.updateUsage).toHaveBeenCalledWith(
        2,
        'users',
        1,
      );
      expect(mockEmailQueueService.queueWelcomeEmail).toHaveBeenCalledWith(
        'new@example.com',
        'New',
        'Test Tenant',
      );
      expect(result.id).toBe('new-id');
    });

    it('should throw ForbiddenException when user cannot manage users', async () => {
      const viewerUser = {
        ...mockUser,
        role: UserRole.VIEWER,
        canManageUsers: () => false,
      };

      await expect(
        service.create({} as any, viewerUser as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create({ email: 'test@example.com' } as any, mockUser as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('RBAC permissions', () => {
    it('should restrict tenant_admin to certain roles', async () => {
      const createDto = {
        email: 'new@example.com',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.SUPER_ADMIN, // Trying to create super_admin
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, mockUser as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow super_admin to assign any role', async () => {
      const superAdmin = {
        ...mockUser,
        role: UserRole.SUPER_ADMIN,
        tenantId: 1,
      };

      const createDto = {
        email: 'admin@test.com',
        password: 'password',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.SUPER_ADMIN,
        tenantId: 1,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ ...createDto, id: 'admin-id' });

      const result = await service.create(createDto, superAdmin as any);

      expect(result.role).toBe(UserRole.SUPER_ADMIN);
    });
  });

  describe('findAll', () => {
    it('should return only tenant users for regular users', async () => {
      const users = [mockUser, { ...mockUser, id: 'user-456' }];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll(2, mockUser as any);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { tenantId: 2 },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(users);
    });

    it('should return all users for super_admin', async () => {
      const superAdmin = {
        ...mockUser,
        role: UserRole.SUPER_ADMIN,
        canViewAllData: () => true,
      };

      const allUsers = [mockUser, { ...mockUser, tenantId: 3 }];
      mockRepository.find.mockResolvedValue(allUsers);

      const result = await service.findAll(1, superAdmin as any);

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        relations: ['tenant'],
      });
    });
  });
});
