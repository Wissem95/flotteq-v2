import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignVehicleDto {
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;
}
