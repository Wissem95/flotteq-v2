import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PartnerAuthService } from './partner-auth.service';
import { PartnersService } from './partners.service';
import { PartnerAuthGuard } from './auth/guards/partner-auth.guard';
import { CurrentPartner } from './decorators/current-partner.decorator';
import { PartnerLoginDto } from './dto/partner-login.dto';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('partners-auth')
@Controller('partners')
export class PartnerAuthController {
  constructor(
    private readonly partnerAuthService: PartnerAuthService,
    private readonly partnersService: PartnersService,
  ) {}

  @Public()
  @Post()
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
  @Post('auth/login')
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

  @Get('auth/profile')
  @UseGuards(PartnerAuthGuard)
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
}
