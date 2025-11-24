import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './services/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 tentatives par minute
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or user already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentatives par minute
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid refresh token',
  })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    // Extraire le userId du refresh token
    const payload = this.jwtService.decode(refreshDto.refreshToken) as any;
    return this.authService.refreshTokens(payload.sub, refreshDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req: any) {
    return req.user;
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 tentatives par minute
  @ApiOperation({
    summary: 'Demander un lien de réinitialisation de mot de passe',
  })
  @ApiResponse({
    status: 200,
    description: "Email envoyé si l'utilisateur existe",
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec le token' })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès',
  })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @Post('accept-invitation')
  @ApiOperation({ summary: 'Accepter une invitation et activer le compte' })
  @ApiResponse({ status: 200, description: 'Compte activé avec succès' })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.authService.acceptInvitation(dto);
  }

  @Public()
  @Get('verify-invitation')
  @ApiOperation({
    summary: "Vérifier un token d'invitation et récupérer l'email",
  })
  @ApiQuery({ name: 'token', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Token valide, informations retournées',
  })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  async verifyInvitation(@Query('token') token: string) {
    return this.authService.verifyInvitation(token);
  }
}
