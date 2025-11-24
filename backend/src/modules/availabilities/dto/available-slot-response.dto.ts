import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AvailableSlotDto {
  @ApiProperty({ example: '14:00', description: 'Time slot in HH:mm format' })
  time: string;

  @ApiProperty({
    example: '16:00',
    description: 'End time of slot in HH:mm format',
  })
  endTime: string;

  @ApiProperty({
    example: true,
    description: 'Is this slot available for booking?',
  })
  available: boolean;

  @ApiPropertyOptional({
    example: 'Already booked',
    description: 'Reason if slot is not available',
  })
  reason?: string;
}

export class AvailableSlotsResponseDto {
  @ApiProperty({
    example: '2025-10-20',
    description: 'Date of availability check',
  })
  date: string;

  @ApiProperty({ example: 30, description: 'Service duration in minutes' })
  duration: number;

  @ApiProperty({ type: [AvailableSlotDto], description: 'List of time slots' })
  slots: AvailableSlotDto[];

  @ApiProperty({ example: 12, description: 'Total number of available slots' })
  availableCount: number;

  @ApiProperty({ example: 5, description: 'Total number of unavailable slots' })
  unavailableCount: number;
}
