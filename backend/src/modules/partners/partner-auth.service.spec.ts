import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { PartnerAuthService } from './partner-auth.service';
import {
  PartnerUser,
  PartnerUserRole,
} from '../../entities/partner-user.entity';
import { Partner, PartnerStatus } from '../../entities/partner.entity';
import { PartnerLoginDto } from './dto/partner-login.dto';

describe('PartnerAuthService', () => {
  let service: PartnerAuthService;
  let partnerUserRepository: jest.Mocked<Repository<PartnerUser>>;
  let partnerRepository: jest.Mocked<Repository<Partner>>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockPartnerUser: Partial<PartnerUser> = {
    id: 'user-123',
    email: 'john@garage.com',
    password: '$2b$10$hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: PartnerUserRole.OWNER,
    isActive: true,
    partnerId: 'partner-123',
    validatePassword: jest.fn(),
  };

  const mockPartner: Partial<Partner> = {
    id: 'partner-123',
    companyName: 'Test Garage',
    status: PartnerStatus.APPROVED,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerAuthService,
        {
          provide: getRepositoryToken(PartnerUser),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Partner),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_PARTNER_SECRET') return 'test-secret';
              if (key === 'PARTNER_TOKEN_EXPIRY') return '7d';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PartnerAuthService>(PartnerAuthService);
    partnerUserRepository = module.get(getRepositoryToken(PartnerUser));
    partnerRepository = module.get(getRepositoryToken(Partner));
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: PartnerLoginDto = {
      email: 'john@garage.com',
      password: 'SecurePass123!',
    };

    it('should login successfully with valid credentials', async () => {
      partnerUserRepository.findOne.mockResolvedValue(
        mockPartnerUser as PartnerUser,
      );
      (mockPartnerUser.validatePassword as jest.Mock).mockResolvedValue(true);
      partnerRepository.findOne.mockResolvedValue(mockPartner as Partner);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'jwt-token');
      expect(result).toHaveProperty('partnerUser');
      expect(result).toHaveProperty('partner');
      expect(partnerUserRepository.update).toHaveBeenCalledWith(
        mockPartnerUser.id,
        expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      partnerUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      partnerUserRepository.findOne.mockResolvedValue(
        mockPartnerUser as PartnerUser,
      );
      (mockPartnerUser.validatePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      partnerUserRepository.findOne.mockResolvedValue({
        ...mockPartnerUser,
        isActive: false,
      } as PartnerUser);
      (mockPartnerUser.validatePassword as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if partner not found', async () => {
      partnerUserRepository.findOne.mockResolvedValue(
        mockPartnerUser as PartnerUser,
      );
      (mockPartnerUser.validatePassword as jest.Mock).mockResolvedValue(true);
      partnerRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if partner not approved', async () => {
      partnerUserRepository.findOne.mockResolvedValue(
        mockPartnerUser as PartnerUser,
      );
      (mockPartnerUser.validatePassword as jest.Mock).mockResolvedValue(true);
      partnerRepository.findOne.mockResolvedValue({
        ...mockPartner,
        status: PartnerStatus.PENDING,
      } as Partner);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException(
          'Your partner account is pending approval. Please wait for admin approval.',
        ),
      );
    });
  });

  describe('validatePartner', () => {
    it('should return partner user if valid and approved', async () => {
      partnerUserRepository.findOne.mockResolvedValue({
        ...mockPartnerUser,
        partner: mockPartner,
      } as PartnerUser);

      const result = await service.validatePartner('user-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('user-123');
    });

    it('should return null if user not found', async () => {
      partnerUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validatePartner('user-123');

      expect(result).toBeNull();
    });

    it('should return null if user is inactive', async () => {
      partnerUserRepository.findOne.mockResolvedValue({
        ...mockPartnerUser,
        isActive: false,
        partner: mockPartner,
      } as PartnerUser);

      const result = await service.validatePartner('user-123');

      expect(result).toBeNull();
    });

    it('should return null if partner not approved', async () => {
      partnerUserRepository.findOne.mockResolvedValue({
        ...mockPartnerUser,
        partner: { ...mockPartner, status: PartnerStatus.PENDING },
      } as PartnerUser);

      const result = await service.validatePartner('user-123');

      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should return partner profile', async () => {
      partnerUserRepository.findOne.mockResolvedValue({
        ...mockPartnerUser,
        partner: mockPartner,
      } as PartnerUser);

      const result = await service.getProfile('user-123');

      expect(result).toHaveProperty('id', 'user-123');
      expect(result).toHaveProperty('partner');
      expect(result.partner).toHaveProperty('companyName', 'Test Garage');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      partnerUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('user-123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
