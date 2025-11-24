import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AvailabilitiesService } from './availabilities.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AddUnavailabilityDto } from './dto/add-unavailability.dto';
import { UpdateUnavailabilityDto } from './dto/update-unavailability.dto';
import { AvailableSlotsQueryDto } from './dto/available-slots-query.dto';
import { AvailableSlotsResponseDto } from './dto/available-slot-response.dto';
import {
  AvailabilityResponseDto,
  UnavailabilityResponseDto,
} from './dto/availability-response.dto';
import { HybridAuthGuard } from '../../core/auth/guards/hybrid-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

interface RequestWithUser {
  user: {
    userId: string;
    tenantId?: number;
    partnerId?: string;
  };
}

@ApiTags('Availabilities')
@Controller('availabilities')
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  // ==================== AVAILABILITY RULES (Partner Only) ====================

  @Post()
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create availability rule (Partner only)' })
  @ApiResponse({
    status: 201,
    description: 'Availability created successfully',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - Partner only' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Availability already exists for this day',
  })
  async create(
    @Body() dto: SetAvailabilityDto,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      throw new BadRequestException('Only partners can create availabilities');
    }

    const availability = await this.availabilitiesService.setAvailability(
      partnerId,
      dto,
      req.user.userId,
    );

    return {
      message: 'Availability created successfully',
      availability: this.toResponseDto(availability),
    };
  }

  @Post('bulk')
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create multiple availability rules for the week (Partner only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Availabilities created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - Partner only' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Some availabilities already exist',
  })
  async createBulk(
    @Body() dtos: SetAvailabilityDto[],
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      throw new BadRequestException('Only partners can create availabilities');
    }

    if (!Array.isArray(dtos) || dtos.length === 0) {
      throw new BadRequestException('Request body must be a non-empty array');
    }

    const availabilities =
      await this.availabilitiesService.setMultipleAvailabilities(
        partnerId,
        dtos,
        req.user.userId,
      );

    return {
      message: `${availabilities.length} availabilities created successfully`,
      availabilities: availabilities.map((a) => this.toResponseDto(a)),
    };
  }

  @Patch(':id')
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update availability rule (Partner only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - Partner only' })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      throw new BadRequestException('Only partners can update availabilities');
    }

    const availability = await this.availabilitiesService.updateAvailability(
      id,
      partnerId,
      dto,
      req.user.userId,
    );

    return {
      message: 'Availability updated successfully',
      availability: this.toResponseDto(availability),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete availability rule (Partner only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Availability deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Partner only' })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  async remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      throw new BadRequestException('Only partners can delete availabilities');
    }

    await this.availabilitiesService.removeAvailability(
      id,
      partnerId,
      req.user.userId,
    );
  }

  @Get('me')
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my availability rules (Partner only)' })
  @ApiResponse({
    status: 200,
    description: 'Availabilities retrieved successfully',
    type: [AvailabilityResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Partner only' })
  async getMyAvailabilities(@Request() req: RequestWithUser): Promise<any> {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      throw new BadRequestException(
        'Only partners can view their availabilities',
      );
    }

    const availabilities =
      await this.availabilitiesService.getAllAvailabilities(partnerId);

    return {
      message: 'Availabilities retrieved successfully',
      count: availabilities.length,
      availabilities,
    };
  }

  // ==================== PUBLIC ENDPOINTS ====================

  @Get(':partnerId')
  @Public()
  @ApiOperation({
    summary: 'Get all availability rules for a partner (Public)',
  })
  @ApiParam({ name: 'partnerId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Availabilities retrieved successfully',
    type: [AvailabilityResponseDto],
  })
  async getPartnerAvailabilities(
    @Param('partnerId') partnerId: string,
  ): Promise<any> {
    const availabilities =
      await this.availabilitiesService.getAllAvailabilities(partnerId);

    return {
      message: 'Availabilities retrieved successfully',
      partnerId,
      count: availabilities.length,
      availabilities,
    };
  }

  @Get(':partnerId/slots')
  @Public()
  @ApiOperation({
    summary: 'Get available time slots for a specific date (Public)',
  })
  @ApiParam({ name: 'partnerId', format: 'uuid' })
  @ApiQuery({
    name: 'date',
    example: '2025-10-20',
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'duration',
    example: 30,
    description: 'Service duration in minutes',
  })
  @ApiQuery({
    name: 'advanceNoticeHours',
    example: 24,
    required: false,
    description: 'Minimum advance notice in hours',
  })
  @ApiResponse({
    status: 200,
    description: 'Available slots retrieved successfully',
    type: AvailableSlotsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async getAvailableSlots(
    @Param('partnerId') partnerId: string,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<any> {
    const slots = await this.availabilitiesService.getAvailableSlots(
      partnerId,
      query,
    );

    return {
      message: 'Available slots retrieved successfully',
      partnerId,
      ...slots,
    };
  }

  // ==================== UNAVAILABILITIES (Partner Only) ====================

  @Get('unavailability/list')
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my unavailabilities (Partner only)' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-10-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-10-31' })
  @ApiResponse({
    status: 200,
    description: 'Unavailabilities retrieved successfully',
    type: [UnavailabilityResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Partner only' })
  async getMyUnavailabilities(
    @Request() req: RequestWithUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      throw new BadRequestException(
        'Only partners can view their unavailabilities',
      );
    }

    const unavailabilities =
      await this.availabilitiesService.getUnavailabilities(
        partnerId,
        startDate,
        endDate,
      );

    return {
      message: 'Unavailabilities retrieved successfully',
      count: unavailabilities.length,
      unavailabilities,
    };
  }

  @Post('unavailability')
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add unavailability (Partner only)' })
  @ApiResponse({
    status: 201,
    description: 'Unavailability created successfully',
    type: UnavailabilityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - Partner only' })
  async addUnavailability(
    @Body() dto: AddUnavailabilityDto,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      throw new BadRequestException('Only partners can add unavailabilities');
    }

    const unavailability = await this.availabilitiesService.addUnavailability(
      partnerId,
      dto,
      req.user.userId,
    );

    return {
      message: 'Unavailability created successfully',
      unavailability,
    };
  }

  @Patch('unavailability/:id')
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update unavailability (Partner only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Unavailability updated successfully',
    type: UnavailabilityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - Partner only' })
  @ApiResponse({ status: 404, description: 'Unavailability not found' })
  async updateUnavailability(
    @Param('id') id: string,
    @Body() dto: UpdateUnavailabilityDto,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      throw new BadRequestException(
        'Only partners can update unavailabilities',
      );
    }

    const unavailability =
      await this.availabilitiesService.updateUnavailability(
        id,
        partnerId,
        dto,
        req.user.userId,
      );

    return {
      message: 'Unavailability updated successfully',
      unavailability,
    };
  }

  @Delete('unavailability/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove unavailability (Partner only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Unavailability deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Partner only' })
  @ApiResponse({ status: 404, description: 'Unavailability not found' })
  async removeUnavailability(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      throw new BadRequestException(
        'Only partners can delete unavailabilities',
      );
    }

    await this.availabilitiesService.removeUnavailability(
      id,
      partnerId,
      req.user.userId,
    );
  }

  // ==================== HELPER METHODS ====================

  private toResponseDto(availability: any): AvailabilityResponseDto {
    return {
      id: availability.id,
      partnerId: availability.partnerId,
      dayOfWeek: availability.dayOfWeek,
      dayName: availability.getDayName(),
      startTime: availability.startTime,
      endTime: availability.endTime,
      slotDuration: availability.slotDuration,
      totalSlots: availability.getTotalSlots(),
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
    };
  }
}
