import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'ID of the subscription plan', example: 1 })
  @IsNumber()
  planId: number;

  @ApiProperty({ description: 'Success URL after payment', required: false })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiProperty({ description: 'Cancel URL if user cancels', required: false })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
