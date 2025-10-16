import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../../../entities/booking.entity';

export class UpdateBookingDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ example: 'Replaced brake pads and rotors' })
  @IsOptional()
  @IsString()
  partnerNotes?: string;

  @ApiPropertyOptional({ example: 'Please arrive 10 minutes early' })
  @IsOptional()
  @IsString()
  customerNotes?: string;
}
