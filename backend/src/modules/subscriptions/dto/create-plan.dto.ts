import { IsString, IsNumber, IsArray, Min, IsOptional } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(-1)
  maxVehicles: number;

  @IsNumber()
  @Min(-1)
  maxUsers: number;

  @IsNumber()
  @Min(-1)
  maxDrivers: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  trialDays?: number;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsOptional()
  @IsString()
  stripeProductId?: string;

  @IsOptional()
  @IsString()
  stripePriceId?: string;
}
