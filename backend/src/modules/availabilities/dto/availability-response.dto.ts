import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AvailabilityResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  partnerId: string;

  @ApiProperty({ example: 1, description: 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday' })
  dayOfWeek: number;

  @ApiProperty({ example: 'Monday', description: 'Name of the day' })
  dayName: string;

  @ApiProperty({ example: '09:00' })
  startTime: string;

  @ApiProperty({ example: '18:00' })
  endTime: string;

  @ApiProperty({ example: 30, description: 'Slot duration in minutes' })
  slotDuration: number;

  @ApiProperty({ example: 18, description: 'Number of slots in this availability' })
  totalSlots: number;

  @ApiProperty({ example: '2025-10-19T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-10-19T12:00:00.000Z' })
  updatedAt: string;
}

export class UnavailabilityResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  partnerId: string;

  @ApiProperty({ example: '2025-10-20' })
  date: Date;

  @ApiProperty({ example: 'Holiday' })
  reason: string;

  @ApiProperty({ example: true })
  isFullDay: boolean;

  @ApiPropertyOptional({ example: '09:00' })
  startTime: string | null;

  @ApiPropertyOptional({ example: '12:00' })
  endTime: string | null;

  @ApiProperty({ example: '2025-10-19T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-10-19T12:00:00.000Z' })
  updatedAt: string;
}
