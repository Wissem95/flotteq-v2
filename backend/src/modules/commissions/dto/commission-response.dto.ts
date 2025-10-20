import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommissionStatus } from '../../../entities/commission.entity';

export class CommissionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  partnerId: string;

  @ApiProperty({ example: 'Garage Martin' })
  partnerName: string;

  @ApiProperty({ format: 'uuid' })
  bookingId: string;

  @ApiProperty({ example: 'BK-2025-001' })
  bookingReference: string;

  @ApiProperty({ example: 8.99, description: 'Commission amount in EUR' })
  amount: number;

  @ApiProperty({ enum: CommissionStatus, example: 'pending' })
  status: CommissionStatus;

  @ApiPropertyOptional()
  paidAt: Date | null;

  @ApiPropertyOptional({ example: 'BANK_TRANSFER_20251018_001' })
  paymentReference: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Booking details (tenant, vehicle, service)' })
  booking?: {
    tenant?: { id: number; name: string };
    vehicle?: { id: string; registration: string; brand: string; model: string };
    service?: { id: string; name: string };
  };
}

export class CommissionListResponseDto {
  @ApiProperty({ type: [CommissionResponseDto] })
  data: CommissionResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class CommissionTotalDto {
  @ApiProperty({ example: 250.50, description: 'Total commission amount in EUR' })
  totalAmount: number;

  @ApiProperty({ example: 10 })
  count: number;

  @ApiProperty({ enum: CommissionStatus })
  status: CommissionStatus;
}
