import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Stripe customer ID',
    example: 'cus_xxxxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    description: 'Stripe price ID',
    example: 'price_xxxxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  priceId: string;
}
