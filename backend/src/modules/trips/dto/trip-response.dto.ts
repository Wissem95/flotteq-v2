import { ApiProperty } from '@nestjs/swagger';
import { Trip, TripStatus } from '../../../entities/trip.entity';

export class TripResponseDto {
  @ApiProperty()
  trip: Trip;
}

export class CurrentTripDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  vehicleId: string;

  @ApiProperty()
  vehicleRegistration: string;

  @ApiProperty()
  startKm: number;

  @ApiProperty()
  startFuelLevel: number;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ enum: TripStatus })
  status: TripStatus;
}

export class TripListResponseDto {
  @ApiProperty({ type: [Trip] })
  data: Trip[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
