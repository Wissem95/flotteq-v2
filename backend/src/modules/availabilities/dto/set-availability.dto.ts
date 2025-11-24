import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'isMultipleOfFive', async: false })
export class IsMultipleOfFiveConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    return typeof value === 'number' && value % 5 === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Slot duration must be a multiple of 5 minutes';
  }
}

export class SetAvailabilityDto {
  @ApiProperty({
    example: 1,
    description: 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00', description: 'Start time in HH:mm format' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format (e.g., 09:00)',
  })
  startTime: string;

  @ApiProperty({ example: '18:00', description: 'End time in HH:mm format' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format (e.g., 18:00)',
  })
  endTime: string;

  @ApiProperty({
    example: 30,
    description: 'Slot duration in minutes (5-120, multiple of 5 preferred)',
    minimum: 5,
    maximum: 120,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(5, { message: 'Minimum slot duration is 5 minutes' })
  @Max(120, { message: 'Maximum slot duration is 120 minutes' })
  @Validate(IsMultipleOfFiveConstraint)
  slotDuration: number;
}
