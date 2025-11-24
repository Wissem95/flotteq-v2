import { IsNotEmpty, IsDateString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RescheduleBookingDto {
  @ApiProperty({
    example: '2025-10-25',
    description: 'New scheduled date (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ example: '10:00', description: 'New scheduled time (HH:mm)' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'scheduledTime must be in HH:mm format (e.g., 10:00)',
  })
  scheduledTime: string;

  @ApiProperty({ example: '12:00', description: 'New end time (HH:mm)' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format (e.g., 12:00)',
  })
  endTime: string;
}
