import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PartnerAuthService } from './partner-auth.service';
import { PartnersService } from './partners.service';
import { HybridAuthGuard } from '../../core/auth/guards/hybrid-auth.guard';
import { CurrentPartner } from './decorators/current-partner.decorator';
import { PartnerLoginDto } from './dto/partner-login.dto';
import { PartnerForgotPasswordDto } from './dto/partner-forgot-password.dto';
import { PartnerResetPasswordDto } from './dto/partner-reset-password.dto';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('partners-auth')
@Controller('partners/auth')
export class PartnerAuthController {
  constructor(
    private readonly partnerAuthService: PartnerAuthService,
    private readonly partnersService: PartnersService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new partner (public)' })
  @ApiResponse({
    status: 201,
    description: 'Partner registered successfully. Pending admin approval.',
  })
  @ApiResponse({ status: 409, description: 'Email or SIRET already exists.' })
  async register(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Partner user login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns JWT token.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or partner not approved.',
  })
  async login(@Body() loginDto: PartnerLoginDto) {
    return this.partnerAuthService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get partner profile (authenticated)' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@CurrentPartner('partnerUserId') partnerUserId: string) {
    return this.partnerAuthService.getProfile(partnerUserId);
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary:
      'Demander un lien de réinitialisation de mot de passe (partenaire)',
  })
  @ApiResponse({
    status: 200,
    description: "Email envoyé si le partenaire existe",
  })
  async forgotPassword(@Body() dto: PartnerForgotPasswordDto) {
    return this.partnerAuthService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({
    summary: 'Réinitialiser le mot de passe partenaire avec le token',
  })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès',
  })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  async resetPassword(@Body() dto: PartnerResetPasswordDto) {
    return this.partnerAuthService.resetPassword(dto.token, dto.newPassword);
  }
}
