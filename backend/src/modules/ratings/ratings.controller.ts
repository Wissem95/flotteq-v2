import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingListResponseDto } from './dto/rating-response.dto';
import { HybridAuthGuard } from '../../core/auth/guards/hybrid-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

interface RequestWithUser {
  user: {
    userId: string;
    tenantId: number;
    partnerId?: string;
  };
}

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(HybridAuthGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create rating for completed booking (Tenant only)',
  })
  @ApiResponse({ status: 201, description: 'Rating created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Booking not completed or already rated',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized - tenant users only',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 409, description: 'Booking already rated' })
  async create(
    @Body() createRatingDto: CreateRatingDto,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    // Prevent partners from creating ratings
    if (req.user.partnerId) {
      return {
        statusCode: 403,
        message: 'Only tenant users can create ratings',
      };
    }

    const rating = await this.ratingsService.create(
      createRatingDto,
      tenantId,
      userId,
    );

    return {
      message: 'Rating created successfully',
      rating,
    };
  }

  @Get('my-ratings')
  @UseGuards(HybridAuthGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.VIEWER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenant ratings history' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Ratings retrieved successfully',
    type: RatingListResponseDto,
  })
  async getMyRatings(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Request() req: RequestWithUser,
  ): Promise<RatingListResponseDto> {
    const tenantId = req.user.tenantId;

    // Prevent partners from accessing this
    if (req.user.partnerId) {
      return {
        ratings: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
    }

    return this.ratingsService.findByTenant(tenantId, page, limit);
  }

  @Get('partner/:partnerId')
  @ApiOperation({ summary: 'Get ratings for a specific partner (Public)' })
  @ApiParam({ name: 'partnerId', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Partner ratings retrieved successfully',
    type: RatingListResponseDto,
  })
  async getPartnerRatings(
    @Param('partnerId') partnerId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<RatingListResponseDto> {
    return this.ratingsService.findByPartner(partnerId, page, limit);
  }

  @Get('can-rate/:bookingId')
  @UseGuards(HybridAuthGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if booking can be rated' })
  @ApiParam({ name: 'bookingId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Returns whether booking can be rated',
  })
  async canRate(
    @Param('bookingId') bookingId: string,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const tenantId = req.user.tenantId;

    const canRate = await this.ratingsService.canRateBooking(
      bookingId,
      tenantId,
    );

    return {
      canRate,
      message: canRate
        ? 'Booking can be rated'
        : 'Booking cannot be rated (not completed, not yours, or already rated)',
    };
  }
}
