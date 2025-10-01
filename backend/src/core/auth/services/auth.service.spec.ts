import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserRole } from '../../../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser: User = {
    id: 'uuid-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    tenantId: 1,
    role: UserRole.VIEWER,
    isActive: true,
    phone: null,
    lastLoginAt: null,
    refreshToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenant: null,
    hashPassword: jest.fn(),
    validatePassword: jest.fn().mockResolvedValue(true),
    get fullName() { return 'John Doe'; },
    isFlotteQUser: jest.fn().mockReturnValue(false),
    canManageUsers: jest.fn().mockReturnValue(false),
    canViewAllData: jest.fn().mockReturnValue(false),
  } as any;

  const mockTokens = {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                JWT_ACCESS_SECRET: 'test_access_secret',
                JWT_REFRESH_SECRET: 'test_refresh_secret',
                JWT_ACCESS_EXPIRES: '15m',
                JWT_REFRESH_EXPIRES: '7d',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      tenantId: '1',
    };

    it('should successfully register a new user', async () => {
      // Mock: email doesn't exist
      userRepository.findOne.mockResolvedValue(null);

      // Mock: save user
      const savedUser = { ...mockUser, ...registerDto, id: 'new-uuid', tenantId: parseInt(registerDto.tenantId || '1') };
      userRepository.save.mockResolvedValue(savedUser as any);

      // Mock: JWT tokens
      jwtService.signAsync
        .mockResolvedValueOnce(mockTokens.access_token)
        .mockResolvedValueOnce(mockTokens.refresh_token);

      // Mock: update refresh token
      userRepository.update.mockResolvedValue(undefined as any);

      const result = await service.register(registerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token', mockTokens.access_token);
      expect(result).toHaveProperty('refresh_token', mockTokens.refresh_token);
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshToken');
    });

    it('should throw ConflictException if email already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already exists',
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should hash password with bcrypt rounds=12', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);
      jwtService.signAsync
        .mockResolvedValueOnce(mockTokens.access_token)
        .mockResolvedValueOnce(mockTokens.refresh_token);

      const bcryptSpy = jest.spyOn(bcrypt, 'hash');

      await service.register(registerDto);

      expect(bcryptSpy).toHaveBeenCalledWith(registerDto.password, 12);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      const userWithPassword = { ...mockUser, password: 'hashedPassword' };
      userRepository.findOne.mockResolvedValue(userWithPassword as any);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      jwtService.signAsync
        .mockResolvedValueOnce(mockTokens.access_token)
        .mockResolvedValueOnce(mockTokens.refresh_token);

      userRepository.update.mockResolvedValue(undefined as any);

      const result = await service.login(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        select: [
          'id',
          'email',
          'password',
          'firstName',
          'lastName',
          'tenantId',
          'role',
          'isActive',
          'createdAt',
          'updatedAt',
        ],
      });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear refresh token', async () => {
      userRepository.update.mockResolvedValue(undefined as any);

      const result = await service.logout('uuid-123');

      expect(userRepository.update).toHaveBeenCalledWith('uuid-123', {
        refreshToken: null,
      });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('refreshTokens', () => {
    const userId = 'uuid-123';
    const refreshToken = 'valid_refresh_token';

    it('should successfully refresh tokens with valid refresh token', async () => {
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: 'hashedRefreshToken',
      };
      userRepository.findOne.mockResolvedValue(userWithRefreshToken as any);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      jwtService.signAsync
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');

      userRepository.update.mockResolvedValue(undefined as any);

      const result = await service.refreshTokens(userId, refreshToken);

      expect(result).toHaveProperty('access_token', 'new_access_token');
      expect(result).toHaveProperty('refresh_token', 'new_refresh_token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        'Access Denied',
      );
    });

    it('should throw UnauthorizedException if refresh token is null', async () => {
      const userWithoutRefreshToken = { ...mockUser, refreshToken: null };
      userRepository.findOne.mockResolvedValue(userWithoutRefreshToken as any);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if refresh token does not match', async () => {
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: 'hashedRefreshToken',
      };
      userRepository.findOne.mockResolvedValue(userWithRefreshToken as any);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user without sensitive data', async () => {
      const userWithoutPassword = {
        id: mockUser.id,
        email: mockUser.email,
        tenantId: mockUser.tenantId,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      };
      userRepository.findOne.mockResolvedValue(userWithoutPassword as User);

      const result = await service.validateUser('uuid-123');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        select: ['id', 'email', 'tenantId', 'role', 'isActive', 'firstName', 'lastName'],
      });
      expect(result).toEqual(userWithoutPassword);
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
    });

    it('should return null if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('generateTokens (private method)', () => {
    it('should generate both access and refresh tokens', async () => {
      jwtService.signAsync
        .mockResolvedValueOnce('access_token_value')
        .mockResolvedValueOnce('refresh_token_value');

      // Access private method via service.login which calls it
      userRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      userRepository.update.mockResolvedValue(undefined as any);

      await service.login({ email: 'test@example.com', password: 'pass123' });

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          tenantId: mockUser.tenantId,
          role: mockUser.role,
        }),
        expect.objectContaining({
          secret: 'test_access_secret',
          expiresIn: '15m',
        }),
      );
    });
  });

  describe('updateRefreshToken (private method)', () => {
    it('should hash and update refresh token', async () => {
      const bcryptSpy = jest.spyOn(bcrypt, 'hash');
      userRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.signAsync
        .mockResolvedValueOnce('access')
        .mockResolvedValueOnce('refresh');
      userRepository.update.mockResolvedValue(undefined as any);

      await service.login({ email: 'test@example.com', password: 'pass' });

      expect(bcryptSpy).toHaveBeenCalledWith('refresh', 10);
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          refreshToken: expect.any(String),
        }),
      );
    });
  });
});