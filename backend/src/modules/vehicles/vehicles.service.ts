import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { VehicleStatsDto, VehicleStatusCount } from './dto/vehicle-stats.dto';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(
    createVehicleDto: CreateVehicleDto,
    tenantId: number,
  ): Promise<Vehicle> {
    // Vérifier si la plaque existe déjà pour ce tenant
    const existingVehicle = await this.vehicleRepository.findOne({
      where: {
        registration: createVehicleDto.registration,
        tenantId,
      },
    });

    if (existingVehicle) {
      throw new ConflictException(
        `Vehicle with registration ${createVehicleDto.registration} already exists`,
      );
    }

    // Vérifier si le VIN existe déjà pour ce tenant
    const existingVin = await this.vehicleRepository.findOne({
      where: {
        vin: createVehicleDto.vin,
        tenantId,
      },
    });

    if (existingVin) {
      throw new ConflictException(
        `Vehicle with VIN ${createVehicleDto.vin} already exists`,
      );
    }

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      tenantId,
    } as any);

    const savedVehicle = await this.vehicleRepository.save(vehicle) as unknown as Vehicle;
    this.logger.log(`Vehicle ${savedVehicle.id} created for tenant ${tenantId}`);

    return savedVehicle;
  }

  async findAll(
    queryDto: QueryVehicleDto,
    tenantId: number,
  ): Promise<{ data: Vehicle[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.vehicleRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.tenantId = :tenantId', { tenantId });

    // Appliquer les filtres
    if (filters.status) {
      queryBuilder.andWhere('vehicle.status = :status', {
        status: filters.status,
      });
    }

    if (filters.brand) {
      queryBuilder.andWhere('vehicle.brand ILIKE :brand', {
        brand: `%${filters.brand}%`,
      });
    }

    if (filters.model) {
      queryBuilder.andWhere('vehicle.model ILIKE :model', {
        model: `%${filters.model}%`,
      });
    }

    if (filters.registration) {
      queryBuilder.andWhere('vehicle.registration ILIKE :registration', {
        registration: `%${filters.registration}%`,
      });
    }

    if (filters.assignedDriverId) {
      queryBuilder.andWhere('vehicle.assignedDriverId = :assignedDriverId', {
        assignedDriverId: filters.assignedDriverId,
      });
    }

    // Pagination
    queryBuilder.skip(skip).take(limit);

    // Trier par date de création décroissante
    queryBuilder.orderBy('vehicle.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, tenantId: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
    tenantId: number,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id, tenantId);

    // Vérifier si la nouvelle plaque existe déjà
    if (
      updateVehicleDto.registration &&
      updateVehicleDto.registration !== vehicle.registration
    ) {
      const existingVehicle = await this.vehicleRepository.findOne({
        where: {
          registration: updateVehicleDto.registration,
          tenantId,
        },
      });

      if (existingVehicle) {
        throw new ConflictException(
          `Vehicle with registration ${updateVehicleDto.registration} already exists`,
        );
      }
    }

    // Vérifier si le nouveau VIN existe déjà
    if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
      const existingVin = await this.vehicleRepository.findOne({
        where: {
          vin: updateVehicleDto.vin,
          tenantId,
        },
      });

      if (existingVin) {
        throw new ConflictException(
          `Vehicle with VIN ${updateVehicleDto.vin} already exists`,
        );
      }
    }

    Object.assign(vehicle, updateVehicleDto);
    const updatedVehicle = await this.vehicleRepository.save(vehicle);

    this.logger.log(`Vehicle ${id} updated for tenant ${tenantId}`);
    return updatedVehicle;
  }

  async remove(id: string, tenantId: number): Promise<void> {
    const vehicle = await this.findOne(id, tenantId);
    await this.vehicleRepository.remove(vehicle);
    this.logger.log(`Vehicle ${id} deleted for tenant ${tenantId}`);
  }

  async count(tenantId: number): Promise<number> {
    return this.vehicleRepository.count({ where: { tenantId } });
  }

  async getStats(tenantId: number): Promise<VehicleStatsDto> {
    // Nombre total de véhicules
    const total = await this.count(tenantId);

    // Répartition par statut
    const byStatusResult = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .select('vehicle.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('vehicle.tenantId = :tenantId', { tenantId })
      .groupBy('vehicle.status')
      .getRawMany();

    const byStatus: VehicleStatusCount[] = byStatusResult.map((row) => ({
      status: row.status,
      count: parseInt(row.count, 10),
    }));

    // Kilométrage moyen
    const avgMileageResult = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .select('AVG(vehicle.mileage)', 'avg')
      .where('vehicle.tenantId = :tenantId', { tenantId })
      .getRawOne();

    const averageMileage = parseFloat(avgMileageResult?.avg || '0');

    // Véhicules nécessitant maintenance (> 10000km)
    const needingMaintenance = await this.vehicleRepository.count({
      where: {
        tenantId,
      },
    });

    // Compter ceux avec plus de 10000km
    const needingMaintenanceResult = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.tenantId = :tenantId', { tenantId })
      .andWhere('vehicle.mileage > 10000')
      .getCount();

    return {
      total,
      byStatus,
      averageMileage: Math.round(averageMileage),
      needingMaintenance: needingMaintenanceResult,
    };
  }
}
