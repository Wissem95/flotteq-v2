import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../../../entities/booking.entity';

export class BookingResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  partnerId: string;

  @ApiProperty()
  partnerName: string;

  @ApiProperty()
  tenantId: number;

  @ApiProperty({ format: 'uuid' })
  vehicleId: string;

  @ApiProperty()
  vehicleRegistration: string;

  @ApiPropertyOptional({ format: 'uuid' })
  driverId: string | null;

  @ApiPropertyOptional()
  driverName: string | null;

  @ApiProperty({ format: 'uuid' })
  serviceId: string;

  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  serviceDescription: string | null;

  @ApiProperty()
  scheduledDate: Date;

  @ApiProperty()
  scheduledTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty()
  price: number;

  @ApiProperty()
  commissionAmount: number;

  @ApiPropertyOptional()
  customerNotes: string | null;

  @ApiPropertyOptional()
  partnerNotes: string | null;

  @ApiPropertyOptional()
  rejectionReason: string | null;

  @ApiPropertyOptional()
  cancellationReason: string | null;

  @ApiPropertyOptional()
  confirmedAt: Date | null;

  @ApiPropertyOptional()
  completedAt: Date | null;

  @ApiPropertyOptional()
  paidAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BookingListResponseDto {
  @ApiProperty({ type: [BookingResponseDto] })
  data: BookingResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
