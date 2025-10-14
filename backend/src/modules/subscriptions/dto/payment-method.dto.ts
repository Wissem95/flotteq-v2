import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
  @ApiProperty({ description: 'Payment method ID' })
  id: string;

  @ApiProperty({ description: 'Card brand', example: 'visa' })
  brand: string;

  @ApiProperty({ description: 'Last 4 digits of card', example: '4242' })
  last4: string;

  @ApiProperty({ description: 'Expiration month', example: 12 })
  expMonth: number;

  @ApiProperty({ description: 'Expiration year', example: 2025 })
  expYear: number;
}
