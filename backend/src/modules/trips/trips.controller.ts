import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { TripsService } from './trips.service';
import { TripFilterDto } from './dto/trip-filter.dto';
import { TripResponseDto, TripListResponseDto } from './dto/trip-response.dto';

@ApiTags('trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all trips (admin)' })
  async getAllTrips(
    @Request() req: ExpressRequest,
    @Query() filterDto: TripFilterDto,
  ): Promise<TripListResponseDto> {
    const user = (req as any).user;
    return await this.tripsService.getAllTrips(user.tenantId, filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID' })
  async getTripById(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
  ): Promise<TripResponseDto> {
    const user = (req as any).user;
    const trip = await this.tripsService.getTripById(id, user.tenantId);
    return { trip };
  }
}
