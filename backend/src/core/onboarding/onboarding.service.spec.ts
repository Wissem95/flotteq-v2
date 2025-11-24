import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { Tenant } from '../../entities/tenant.entity';
import { Vehicle, VehicleStatus } from '../../entities/vehicle.entity';
import { User, UserRole } from '../../entities/user.entity';
import { EmailService } from '../../modules/notifications/email.service';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('OnboardingService', () => {
  let service: OnboardingService;
  let tenantsRepository: Repository<Tenant>;
  let vehiclesRepository: Repository<Vehicle>;
  let usersRepository: Repository<User>;
  let emailService: EmailService;

  const mockTenant = {
    id: 1,
    name: 'Test Tenant',
    email: 'test@example.com',
  };

  const mockUser = {
    id: 'user-123',
    email: 'admin@example.com',
    tenantId: 1,
    tenant: mockTenant,
  };

  const mockTenantsRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockVehiclesRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEmailService = {
    sendDriverWelcomeEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantsRepository,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockVehiclesRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    tenantsRepository = module.get<Repository<Tenant>>(
      getRepositoryToken(Tenant),
    );
    vehiclesRepository = module.get<Repository<Vehicle>>(
      getRepositoryToken(Vehicle),
    );
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('completeOnboarding', () => {
    const completeDto: CompleteOnboardingDto = {
      profile: {
        companyName: 'New Company',
        companyAddress: '123 Test St',
        companyCity: 'Paris',
        companyPostalCode: '75001',
        companyCountry: 'France',
        fleetSize: 5,
      },
    };

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.completeOnboarding('user-123', completeDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue({ id: 'user-123' });

      await expect(
        service.completeOnboarding('user-123', completeDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update tenant profile successfully', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockTenantsRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.completeOnboarding('user-123', completeDto);

      expect(mockTenantsRepository.update).toHaveBeenCalledWith(1, {
        name: 'New Company',
        address: '123 Test St',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        onboardingCompleted: true,
      });
      expect(result.message).toBe('Onboarding complété avec succès');
    });

    it('should create vehicle if provided', async () => {
      const dtoWithVehicle = {
        ...completeDto,
        vehicle: {
          licensePlate: 'AB-123-CD',
          brand: 'Renault',
          model: 'Kangoo',
          year: 2023,
        },
      };

      const mockVehicle = {
        registration: 'AB-123-CD',
        brand: 'Renault',
        model: 'Kangoo',
        year: 2023,
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockVehiclesRepository.create.mockReturnValue(mockVehicle);
      mockVehiclesRepository.save.mockResolvedValue(mockVehicle);

      await service.completeOnboarding('user-123', dtoWithVehicle);

      expect(mockVehiclesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          registration: 'AB-123-CD',
          brand: 'Renault',
          model: 'Kangoo',
          year: 2023,
          status: VehicleStatus.AVAILABLE,
          tenantId: 1,
        }),
      );
      expect(mockVehiclesRepository.save).toHaveBeenCalled();
    });

    it('should create driver and send welcome email if provided', async () => {
      const dtoWithDriver = {
        ...completeDto,
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+33612345678',
          licenseNumber: '123456789',
        },
      };

      const mockDriver = {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+33612345678',
        role: UserRole.DRIVER,
        tenantId: 1,
      };

      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockUser) // For user lookup
        .mockResolvedValueOnce(null); // For existing driver check
      mockUsersRepository.create.mockReturnValue(mockDriver);
      mockUsersRepository.save.mockResolvedValue(mockDriver);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockEmailService.sendDriverWelcomeEmail.mockResolvedValue(undefined);

      await service.completeOnboarding('user-123', dtoWithDriver);

      expect(mockUsersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.DRIVER,
          tenantId: 1,
        }),
      );
      expect(mockUsersRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendDriverWelcomeEmail).toHaveBeenCalledWith(
        'john@example.com',
        'John',
        'Test Tenant',
        expect.any(String),
      );
    });

    it('should not create driver if email already exists', async () => {
      const dtoWithDriver = {
        ...completeDto,
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'existing@example.com',
          phone: '+33612345678',
          licenseNumber: '123456789',
        },
      };

      const existingDriver = {
        id: 'driver-123',
        email: 'existing@example.com',
      };

      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockUser) // For user lookup
        .mockResolvedValueOnce(existingDriver); // For existing driver check

      await service.completeOnboarding('user-123', dtoWithDriver);

      expect(mockUsersRepository.create).not.toHaveBeenCalled();
      expect(mockUsersRepository.save).not.toHaveBeenCalled();
    });

    it('should not fail if email sending fails', async () => {
      const dtoWithDriver = {
        ...completeDto,
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+33612345678',
          licenseNumber: '123456789',
        },
      };

      const mockDriver = {
        email: 'john@example.com',
        firstName: 'John',
      };

      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockUsersRepository.create.mockReturnValue(mockDriver);
      mockUsersRepository.save.mockResolvedValue(mockDriver);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockEmailService.sendDriverWelcomeEmail.mockRejectedValue(
        new Error('SMTP Error'),
      );

      const result = await service.completeOnboarding(
        'user-123',
        dtoWithDriver,
      );

      expect(result.message).toBe('Onboarding complété avec succès');
    });
  });
});
