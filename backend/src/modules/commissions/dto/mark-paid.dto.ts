import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkPaidDto {
  @ApiProperty({
    example: 'BANK_TRANSFER_20251018_001',
    description: 'Payment reference number or transaction ID',
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  paymentReference: string;
}
