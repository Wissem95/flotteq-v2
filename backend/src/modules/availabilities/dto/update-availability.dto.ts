import { IsOptional, IsInt, Min, Max, Matches, Validate } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMultipleOfFiveConstraint } from './set-availability.dto';

export class UpdateAvailabilityDto {
  @ApiPropertyOptional({ example: '09:00', description: 'Start time in HH:mm format' })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format (e.g., 09:00)',
  })
  startTime?: string;

  @ApiPropertyOptional({ example: '18:00', description: 'End time in HH:mm format' })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format (e.g., 18:00)',
  })
  endTime?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Slot duration in minutes (5-120, multiple of 5 preferred)',
    minimum: 5,
    maximum: 120
  })
  @IsOptional()
  @IsInt()
  @Min(5, { message: 'Minimum slot duration is 5 minutes' })
  @Max(120, { message: 'Maximum slot duration is 120 minutes' })
  @Validate(IsMultipleOfFiveConstraint)
  slotDuration?: number;
}
