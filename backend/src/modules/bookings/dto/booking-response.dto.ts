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

  @ApiProperty()
  tenantName: string;

  @ApiPropertyOptional()
  tenantEmail: string | null;

  @ApiProperty({ format: 'uuid' })
  vehicleId: string;

  @ApiProperty()
  vehicleRegistration: string;

  @ApiProperty()
  vehicleBrand: string;

  @ApiProperty()
  vehicleModel: string;

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

  @ApiProperty({ enum: ['pending', 'paid', 'refunded'] })
  paymentStatus: 'pending' | 'paid' | 'refunded';

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

  @ApiProperty({
    description: 'Whether this booking has been rated by the tenant',
  })
  hasRating: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BookingListResponseDto {
  @ApiProperty({ type: [BookingResponseDto] })
  bookings: BookingResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
