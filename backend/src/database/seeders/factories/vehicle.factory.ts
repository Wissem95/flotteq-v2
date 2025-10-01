import { Vehicle, VehicleStatus } from '../../../entities/vehicle.entity';

export class VehicleFactory {
  static create(data: Partial<Vehicle> = {}): Vehicle {
    const vehicle = new Vehicle();
    vehicle.registration = data.registration || `AB-${Math.floor(Math.random() * 1000)}-CD`;
    vehicle.brand = data.brand || 'Renault';
    vehicle.model = data.model || 'Master';
    vehicle.year = data.year || new Date().getFullYear();
    vehicle.vin = data.vin || `VF${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
    vehicle.color = data.color || 'Blanc';
    vehicle.status = data.status || VehicleStatus.AVAILABLE;
    vehicle.currentKm = data.currentKm || Math.floor(Math.random() * 50000);
    vehicle.initialMileage = data.initialMileage || 0;
    vehicle.purchaseDate = data.purchaseDate || new Date();
    vehicle.purchasePrice = data.purchasePrice || 35000;
    vehicle.tenantId = data.tenantId!;
    return Object.assign(vehicle, data);
  }
}
