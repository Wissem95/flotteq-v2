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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { BookingsPaymentService } from './bookings-payment.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { BookingResponseDto, BookingListResponseDto } from './dto/booking-response.dto';
import { HybridAuthGuard } from '../../core/auth/guards/hybrid-auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';

interface RequestWithUser {
  user: {
    userId: string;
    tenantId: number;
    partnerId?: string;
  };
}

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(HybridAuthGuard, TenantGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly bookingsPaymentService: BookingsPaymentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking (Tenant)' })
  @ApiResponse({ status: 201, description: 'Booking created successfully', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Partner, service, or vehicle not found' })
  async create(@Body() createBookingDto: CreateBookingDto, @Request() req: RequestWithUser): Promise<any> {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const booking = await this.bookingsService.create(createBookingDto, tenantId, userId);

    return {
      message: 'Booking created successfully',
      booking,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings for tenant or partner with filters' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully', type: BookingListResponseDto })
  async findAll(@Query() filters: BookingFilterDto, @Request() req: RequestWithUser): Promise<BookingListResponseDto> {
    // If partner, use findByPartner method
    if (req.user.partnerId) {
      return this.bookingsService.findByPartner(req.user.partnerId, filters);
    }

    // If tenant, use tenantId
    const tenantId = req.user.tenantId;
    return this.bookingsService.findAll(tenantId, filters);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming bookings (next 7 days)' })
  @ApiResponse({ status: 200, description: 'Upcoming bookings retrieved successfully' })
  async findUpcoming(@Request() req: RequestWithUser): Promise<any> {
    const tenantId = req.user.tenantId;
    const bookings = await this.bookingsService.findUpcoming(tenantId, 7);

    return {
      message: 'Upcoming bookings retrieved successfully',
      count: bookings.length,
      bookings,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Booking found', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser): Promise<any> {
    const tenantId = req.user.tenantId;
    const booking = await this.bookingsService.findOne(id, tenantId);

    return {
      message: 'Booking retrieved successfully',
      booking,
    };
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm booking (Partner only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Booking cannot be confirmed in current status' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async confirm(@Param('id') id: string, @Request() req: RequestWithUser): Promise<any> {
    const partnerId = req.user.partnerId; // Assumes partner JWT contains partnerId
    const userId = req.user.userId;

    if (!partnerId) {
      return {
        statusCode: 403,
        message: 'Only partners can confirm bookings',
      };
    }

    const booking = await this.bookingsService.confirm(id, partnerId, userId);

    return {
      message: 'Booking confirmed successfully',
      booking,
    };
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject booking (Partner only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Booking rejected successfully' })
  @ApiResponse({ status: 400, description: 'Booking cannot be rejected in current status' })
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const partnerId = req.user.partnerId;
    const userId = req.user.userId;

    if (!partnerId) {
      return {
        statusCode: 403,
        message: 'Only partners can reject bookings',
      };
    }

    const booking = await this.bookingsService.reject(id, partnerId, reason, userId);

    return {
      message: 'Booking rejected successfully',
      booking,
    };
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule booking (Tenant)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Booking rescheduled successfully' })
  @ApiResponse({ status: 400, description: 'Booking cannot be rescheduled in current status' })
  async reschedule(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleBookingDto,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const booking = await this.bookingsService.reschedule(id, rescheduleDto, tenantId, userId);

    return {
      message: 'Booking rescheduled successfully',
      booking,
    };
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Start work on booking (Partner only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Booking started successfully' })
  async startWork(@Param('id') id: string, @Request() req: RequestWithUser): Promise<any> {
    const partnerId = req.user.partnerId;
    const userId = req.user.userId;

    if (!partnerId) {
      return {
        statusCode: 403,
        message: 'Only partners can start bookings',
      };
    }

    const booking = await this.bookingsService.startWork(id, partnerId, userId);

    return {
      message: 'Booking started successfully',
      booking,
    };
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete booking (Partner only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Booking completed successfully' })
  @ApiResponse({ status: 400, description: 'Booking cannot be completed in current status' })
  async complete(
    @Param('id') id: string,
    @Body('partnerNotes') partnerNotes: string,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const partnerId = req.user.partnerId;
    const userId = req.user.userId;

    if (!partnerId) {
      return {
        statusCode: 403,
        message: 'Only partners can complete bookings',
      };
    }

    const booking = await this.bookingsService.complete(id, partnerId, partnerNotes, userId);

    return {
      message: 'Booking completed successfully',
      booking,
      commission: booking.commissionAmount,
    };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking (Tenant)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Booking cannot be cancelled in current status' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const booking = await this.bookingsService.cancel(id, reason, tenantId, userId);

    return {
      message: 'Booking cancelled successfully',
      booking,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBookingDto,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    const tenantId = req.user.tenantId;

    const booking = await this.bookingsService.update(id, updateDto, tenantId);

    return {
      message: 'Booking updated successfully',
      booking,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete booking (soft delete)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Booking deleted successfully' })
  async remove(@Param('id') id: string, @Request() req: RequestWithUser): Promise<void> {
    const tenantId = req.user.tenantId;
    await this.bookingsService.remove(id, tenantId);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Create payment intent for booking' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Payment intent created' })
  @ApiResponse({ status: 400, description: 'Booking cannot be paid' })
  @ApiResponse({ status: 403, description: 'Not your booking' })
  async createPayment(@Param('id') id: string, @Request() req: RequestWithUser): Promise<any> {
    return this.bookingsPaymentService.createPaymentIntent(id, req.user.tenantId);
  }
}
