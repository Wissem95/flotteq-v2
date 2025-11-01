import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '../../../entities/driver.entity';

export class DriverVehicleDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  registration: string;

  @ApiProperty()
  brand: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  year: number;

  @ApiProperty()
  currentKm: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  lastTechnicalInspection: Date | null;

  @ApiPropertyOptional()
  nextTechnicalInspection: Date | null;

  @ApiPropertyOptional({ type: [String] })
  photos: string[] | null;
}

export class DriverResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  licenseNumber: string;

  @ApiProperty()
  licenseExpiryDate: Date;

  @ApiProperty({ enum: DriverStatus })
  status: DriverStatus;

  @ApiPropertyOptional({ type: DriverVehicleDto })
  assignedVehicle: DriverVehicleDto | null;

  @ApiProperty()
  createdAt: Date;
}
