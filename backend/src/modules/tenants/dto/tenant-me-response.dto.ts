import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for GET /tenants/me endpoint
 * Returns current user's tenant information
 */
export class TenantMeResponseDto {
  @ApiProperty({ example: 1, description: 'Tenant ID' })
  id: number;

  @ApiProperty({ example: 'Acme Corporation', description: 'Company name' })
  name: string;

  @ApiProperty({ example: 'contact@acme.com', description: 'Company email' })
  email: string;

  @ApiPropertyOptional({ example: '123 Main St, Paris 75001', description: 'Company address' })
  address?: string;

  @ApiPropertyOptional({ example: '+33 1 23 45 67 89', description: 'Company phone' })
  phone?: string;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z', description: 'Account creation date' })
  createdAt: Date;
}
