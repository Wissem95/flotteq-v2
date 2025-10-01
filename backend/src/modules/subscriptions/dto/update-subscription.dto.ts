import { IsEnum, IsOptional } from 'class-validator';
import { SubscriptionStatus } from '../../../entities/subscription.entity';

export class UpdateSubscriptionDto {
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;
}
