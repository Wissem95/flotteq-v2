import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class StripeWebhookDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  data: any;
}
