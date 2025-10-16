import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { Partner, PartnerStatus, PartnerType } from '../../entities/partner.entity';
import { PartnerUser, PartnerUserRole } from '../../entities/partner-user.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { EmailQueueService } from '../notifications/email-queue.service';
import { CreatePartnerDto } from './dto/create-partner.dto';

describe('PartnersService', () => {
  let service: PartnersService;
  let partnerRepository: jest.Mocked<Repository<Partner>>;
  let partnerUserRepository: jest.Mocked<Repository<PartnerUser>>;
  let partnerServiceRepository: jest.Mocked<Repository<PartnerService>>;
  let emailQueueService: jest.Mocked<EmailQueueService>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;

  const mockPartner: Partial<Partner> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    companyName: 'Test Garage',
    type: PartnerType.GARAGE,
    email: 'test@garage.com',
    status: PartnerStatus.PENDING,
    siretNumber: '12345678901234',
  };

  const mockCreatePartnerDto: CreatePartnerDto = {
    companyName: 'Test Garage',
    type: PartnerType.GARAGE,
    email: 'test@garage.com',
    phone: '+33612345678',
    address: '123 Rue Test',
    city: 'Paris',
    postalCode: '75001',
    siretNumber: '12345678901234',
    ownerFirstName: 'John',
    ownerLastName: 'Doe',
    ownerEmail: 'john@garage.com',
    ownerPassword: 'SecurePass123!',
  };

  beforeEach(async () => {
    // Create mock query runner
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
      },
    } as any;

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnersService,
        {
          provide: getRepositoryToken(Partner),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PartnerUser),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PartnerService),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: EmailQueueService,
          useValue: {
            queuePartnerWelcomeEmail: jest.fn(),
            queuePartnerApprovedEmail: jest.fn(),
            queuePartnerRejectedEmail: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<PartnersService>(PartnersService);
    partnerRepository = module.get(getRepositoryToken(Partner));
    partnerUserRepository = module.get(getRepositoryToken(PartnerUser));
    partnerServiceRepository = module.get(getRepositoryToken(PartnerService));
    emailQueueService = module.get(EmailQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create partner with owner user successfully', async () => {
      partnerRepository.findOne.mockResolvedValue(null);
      partnerUserRepository.findOne.mockResolvedValue(null);

      const mockCreatedPartner = { ...mockPartner, id: 'new-id' };
      (queryRunner.manager.create as jest.Mock)
        .mockReturnValueOnce(mockCreatedPartner as any)
        .mockReturnValueOnce({} as any);
      (queryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(mockCreatedPartner)
        .mockResolvedValueOnce({});

      const result = await service.create(mockCreatePartnerDto);

      expect(result).toEqual(mockCreatedPartner);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(emailQueueService.queuePartnerWelcomeEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if partner email exists', async () => {
      partnerRepository.findOne.mockResolvedValue(mockPartner as Partner);

      await expect(service.create(mockCreatePartnerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if partner user email exists', async () => {
      partnerRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      partnerUserRepository.findOne.mockResolvedValue({} as PartnerUser);

      await expect(service.create(mockCreatePartnerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if SIRET exists', async () => {
      partnerRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ siretNumber: '12345678901234' } as Partner);
      partnerUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(mockCreatePartnerDto)).rejects.toThrow(ConflictException);
    });

    it('should rollback transaction on error', async () => {
      partnerRepository.findOne.mockResolvedValue(null);
      partnerUserRepository.findOne.mockResolvedValue(null);
      (queryRunner.manager.save as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.create(mockCreatePartnerDto)).rejects.toThrow();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all partners', async () => {
      const partners = [mockPartner, { ...mockPartner, id: 'another-id' }];
      partnerRepository.find.mockResolvedValue(partners as Partner[]);

      const result = await service.findAll();

      expect(result).toEqual(partners);
      expect(partnerRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a partner by id', async () => {
      partnerRepository.findOne.mockResolvedValue(mockPartner as Partner);

      const result = await service.findOne('123');

      expect(result).toEqual(mockPartner);
    });

    it('should throw NotFoundException if partner not found', async () => {
      partnerRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update partner successfully', async () => {
      const updateDto = { phone: '+33698765432' };
      partnerRepository.findOne.mockResolvedValue(mockPartner as Partner);
      partnerRepository.save.mockResolvedValue({ ...mockPartner, ...updateDto } as Partner);

      const result = await service.update('123', updateDto);

      expect(result.phone).toBe(updateDto.phone);
      expect(partnerRepository.save).toHaveBeenCalled();
    });
  });

  describe('approvePartner', () => {
    it('should approve partner and send email', async () => {
      const partner = { ...mockPartner, status: PartnerStatus.PENDING };
      partnerRepository.findOne.mockResolvedValue(partner as Partner);
      partnerRepository.save.mockResolvedValue({
        ...partner,
        status: PartnerStatus.APPROVED,
      } as Partner);
      partnerUserRepository.findOne.mockResolvedValue({
        email: 'owner@test.com',
        firstName: 'John',
      } as PartnerUser);

      const result = await service.approvePartner('123');

      expect(result.status).toBe(PartnerStatus.APPROVED);
      expect(emailQueueService.queuePartnerApprovedEmail).toHaveBeenCalledWith(
        'owner@test.com',
        'John',
        expect.any(String),
      );
    });

    it('should throw BadRequestException if already approved', async () => {
      const partner = { ...mockPartner, status: PartnerStatus.APPROVED };
      partnerRepository.findOne.mockResolvedValue(partner as Partner);

      await expect(service.approvePartner('123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectPartner', () => {
    it('should reject partner and send email', async () => {
      const partner = { ...mockPartner, status: PartnerStatus.PENDING };
      partnerRepository.findOne.mockResolvedValue(partner as Partner);
      partnerRepository.save.mockResolvedValue({
        ...partner,
        status: PartnerStatus.REJECTED,
      } as Partner);
      partnerUserRepository.findOne.mockResolvedValue({
        email: 'owner@test.com',
        firstName: 'John',
      } as PartnerUser);

      const result = await service.rejectPartner('123', 'Test reason');

      expect(result.status).toBe(PartnerStatus.REJECTED);
      expect(emailQueueService.queuePartnerRejectedEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if already rejected', async () => {
      const partner = { ...mockPartner, status: PartnerStatus.REJECTED };
      partnerRepository.findOne.mockResolvedValue(partner as Partner);

      await expect(service.rejectPartner('123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('suspendPartner', () => {
    it('should suspend partner', async () => {
      partnerRepository.findOne.mockResolvedValue(mockPartner as Partner);
      partnerRepository.save.mockResolvedValue({
        ...mockPartner,
        status: PartnerStatus.SUSPENDED,
      } as Partner);

      const result = await service.suspendPartner('123');

      expect(result.status).toBe(PartnerStatus.SUSPENDED);
    });
  });

  describe('updateCommissionRate', () => {
    it('should update commission rate', async () => {
      partnerRepository.findOne.mockResolvedValue(mockPartner as Partner);
      partnerRepository.save.mockResolvedValue({
        ...mockPartner,
        commissionRate: 15,
      } as Partner);

      const result = await service.updateCommissionRate('123', 15);

      expect(result.commissionRate).toBe(15);
    });

    it('should throw BadRequestException for invalid rate', async () => {
      await expect(service.updateCommissionRate('123', -5)).rejects.toThrow(BadRequestException);
      await expect(service.updateCommissionRate('123', 101)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Service CRUD', () => {
    const mockService = {
      id: 'service-id',
      partnerId: '123',
      name: 'Vidange',
      price: 50,
      durationMinutes: 60,
    };

    it('should add service to approved partner', async () => {
      const partner = { ...mockPartner, status: PartnerStatus.APPROVED, isApproved: () => true };
      partnerRepository.findOne.mockResolvedValue(partner as Partner);
      partnerServiceRepository.create.mockReturnValue(mockService as any);
      partnerServiceRepository.save.mockResolvedValue(mockService as PartnerService);

      const result = await service.addService('123', {
        name: 'Vidange',
        price: 50,
        durationMinutes: 60,
      });

      expect(result).toEqual(mockService);
    });

    it('should not allow adding service to unapproved partner', async () => {
      const partner = { ...mockPartner, status: PartnerStatus.PENDING, isApproved: () => false };
      partnerRepository.findOne.mockResolvedValue(partner as Partner);

      await expect(
        service.addService('123', { name: 'Vidange', price: 50, durationMinutes: 60 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update service', async () => {
      partnerServiceRepository.findOne.mockResolvedValue(mockService as PartnerService);
      partnerServiceRepository.save.mockResolvedValue({
        ...mockService,
        price: 60,
      } as PartnerService);

      const result = await service.updateService('service-id', { price: 60 });

      expect(result.price).toBe(60);
    });

    it('should remove service (soft delete)', async () => {
      partnerServiceRepository.findOne.mockResolvedValue(mockService as PartnerService);

      await service.removeService('service-id');

      expect(partnerServiceRepository.softDelete).toHaveBeenCalledWith('service-id');
    });

    it('should get partner services', async () => {
      const services = [mockService];
      partnerServiceRepository.find.mockResolvedValue(services as PartnerService[]);

      const result = await service.getPartnerServices('123');

      expect(result).toEqual(services);
    });
  });
});
