import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({
    format: 'uuid',
    description: 'ID of the completed booking to rate',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  bookingId: string;

  @ApiProperty({
    description: 'Rating score from 1.0 to 5.0',
    minimum: 1,
    maximum: 5,
    example: 4.5,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  score: number;

  @ApiPropertyOptional({
    description: 'Optional comment about the service',
    maxLength: 500,
    example: 'Excellent service, very professional and timely!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
