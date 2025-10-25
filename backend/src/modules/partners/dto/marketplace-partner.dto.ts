import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerType } from '../../../entities/partner.entity';

/**
 * Simplified service DTO for marketplace display
 */
export class MarketplaceServiceDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Vidange complète' })
  name: string;

  @ApiProperty({ example: 89.99, description: 'Price in EUR' })
  price: number;

  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  durationMinutes: number;
}

/**
 * Marketplace partner DTO - simplified response for tenant marketplace search
 * Contains only essential fields needed for partner discovery and booking
 */
export class MarketplacePartnerDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Garage Martin' })
  companyName: string;

  @ApiProperty({ enum: PartnerType, example: 'garage' })
  type: PartnerType;

  @ApiProperty({ example: 'Paris' })
  city: string;

  @ApiProperty({ example: 4.5, description: 'Average rating (0-5)' })
  rating: number;

  @ApiProperty({ example: 127, description: 'Total number of reviews' })
  totalReviews: number;

  @ApiProperty({
    type: [MarketplaceServiceDto],
    description: 'Available services from this partner'
  })
  services: MarketplaceServiceDto[];

  @ApiPropertyOptional({
    example: 3.2,
    description: 'Distance from search point in kilometers (only present in search results)'
  })
  distance?: number;

  @ApiPropertyOptional({
    example: '2025-10-25T09:00:00.000Z',
    description: 'Next available booking slot (if available within next 7 days)'
  })
  nextAvailableSlot?: Date | null;

  @ApiPropertyOptional({
    example: 87.5,
    description: 'Relevance score based on distance, rating, and availability (search only)'
  })
  relevanceScore?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether partner has any availability in requested date range'
  })
  hasAvailability?: boolean;
}
