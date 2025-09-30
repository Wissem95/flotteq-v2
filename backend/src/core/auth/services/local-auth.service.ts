import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../../../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalAuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Vérifie si l'email existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash le password avec un salt de 12
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.userRepository.save({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      tenantId: parseInt(dto.tenantId || '1'),
    });

    const tokens = await this.generateTokens(user);

    // Sauvegarde le refresh token hashé
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    // Ne pas retourner le password
    const { password, refreshToken, ...userWithoutSensitive } = user;

    return { user: userWithoutSensitive, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'lastName',
        'tenantId',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    const { password, ...userWithoutSensitive } = user;

    return { user: userWithoutSensitive, ...tokens };
  }

  async logout(userId: string) {
    // Cast explicite pour gérer le null avec TypeORM
    await this.userRepository.update(userId, {
      refreshToken: null as any
    });
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'tenantId', 'refreshToken'],
    });

    // Vérifier null explicitement
    if (!user || user.refreshToken === null || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const rtMatches = await bcrypt.compare(rt, user.refreshToken);

    if (!rtMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  private async generateTokens(user: Partial<User>) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES', '7d'),
      }),
    ]);

    return { access_token, refresh_token };
  }

  private async updateRefreshToken(userId: string, rt: string) {
    const hashedRefreshToken = await bcrypt.hash(rt, 10);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async validateUser(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'tenantId', 'firstName', 'lastName'],
    });
  }
}