import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RatingResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  bookingId: string;

  @ApiProperty({ type: 'number' })
  tenantId: number;

  @ApiProperty()
  tenantName: string;

  @ApiProperty({ format: 'uuid' })
  partnerId: string;

  @ApiProperty()
  partnerName: string;

  @ApiProperty({ example: 4.5 })
  score: number;

  @ApiPropertyOptional({ example: 'Excellent service!' })
  comment: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class RatingListResponseDto {
  @ApiProperty({ type: [RatingResponseDto] })
  ratings: RatingResponseDto[];

  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 8 })
  totalPages: number;

  @ApiPropertyOptional({ example: 4.5, description: 'Average rating score' })
  averageScore?: number;
}
