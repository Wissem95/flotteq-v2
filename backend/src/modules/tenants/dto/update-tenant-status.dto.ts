import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTenantStatusDto {
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'True pour activer, false pour désactiver le tenant'
  })
  isActive: boolean;
}
