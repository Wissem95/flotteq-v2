import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Maintenance, MaintenanceStatus } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenanceAlertDto, MaintenanceCostSummaryDto } from './dto/maintenance-alert.dto';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto, tenantId: number): Promise<Maintenance> {
    const maintenance = this.maintenanceRepository.create({
      ...createMaintenanceDto,
      tenantId,
      scheduledDate: new Date(createMaintenanceDto.scheduledDate),
    });

    return this.maintenanceRepository.save(maintenance);
  }

  async findAll(tenantId: number): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { tenantId },
      relations: ['vehicle'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: number): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id, tenantId },
      relations: ['vehicle'],
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance with ID ${id} not found`);
    }

    return maintenance;
  }

  async findByVehicle(vehicleId: string, tenantId: number): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { vehicleId, tenantId },
      order: { scheduledDate: 'DESC' },
    });
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto, tenantId: number): Promise<Maintenance> {
    const maintenance = await this.findOne(id, tenantId);

    const updateData: any = { ...updateMaintenanceDto };

    if (updateMaintenanceDto.scheduledDate) {
      updateData.scheduledDate = new Date(updateMaintenanceDto.scheduledDate);
    }

    if (updateMaintenanceDto.completedDate) {
      updateData.completedDate = new Date(updateMaintenanceDto.completedDate);
    }

    Object.assign(maintenance, updateData);

    return this.maintenanceRepository.save(maintenance);
  }

  async remove(id: string, tenantId: number): Promise<void> {
    const maintenance = await this.findOne(id, tenantId);
    await this.maintenanceRepository.remove(maintenance);
  }

  async getUpcomingMaintenances(tenantId: number, daysAhead: number = 7): Promise<MaintenanceAlertDto[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    const maintenances = await this.maintenanceRepository.find({
      where: {
        tenantId,
        status: MaintenanceStatus.SCHEDULED,
        scheduledDate: LessThan(futureDate),
      },
      relations: ['vehicle'],
    });

    return maintenances.map(m => {
      const daysUntil = Math.ceil(
        (new Date(m.scheduledDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        maintenanceId: m.id,
        vehicleRegistration: m.vehicle.registration,
        type: m.type,
        scheduledDate: m.scheduledDate,
        daysUntil,
        alertReason: daysUntil <= 0
          ? 'Maintenance overdue'
          : `Maintenance in ${daysUntil} days`,
      };
    });
  }

  async getMaintenancesByKmAlert(tenantId: number): Promise<MaintenanceAlertDto[]> {
    const maintenances = await this.maintenanceRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.vehicle', 'v')
      .where('m.tenantId = :tenantId', { tenantId })
      .andWhere('m.status = :status', { status: MaintenanceStatus.SCHEDULED })
      .andWhere('m.nextMaintenanceKm IS NOT NULL')
      .andWhere('v.currentKm >= m.nextMaintenanceKm - 1000') // Alert 1000km before
      .getMany();

    return maintenances.map(m => ({
      maintenanceId: m.id,
      vehicleRegistration: m.vehicle.registration,
      type: m.type,
      scheduledDate: m.scheduledDate,
      daysUntil: 0,
      alertReason: `Vehicle at ${m.vehicle.currentKm}km, maintenance scheduled at ${m.nextMaintenanceKm}km`,
    }));
  }

  async getCostSummaryByVehicle(vehicleId: string, tenantId: number): Promise<MaintenanceCostSummaryDto> {
    const result = await this.maintenanceRepository
      .createQueryBuilder('m')
      .select('SUM(m.cost)', 'totalCost')
      .addSelect('COUNT(*)', 'maintenanceCount')
      .addSelect('AVG(m.cost)', 'averageCost')
      .where('m.vehicleId = :vehicleId', { vehicleId })
      .andWhere('m.tenantId = :tenantId', { tenantId })
      .andWhere('m.status = :status', { status: MaintenanceStatus.COMPLETED })
      .getRawOne();

    return {
      vehicleId,
      totalCost: parseFloat(result.totalCost) || 0,
      maintenanceCount: parseInt(result.maintenanceCount) || 0,
      averageCost: parseFloat(result.averageCost) || 0,
    };
  }

  async getTotalCostsByTenant(tenantId: number): Promise<number> {
    const result = await this.maintenanceRepository
      .createQueryBuilder('m')
      .select('SUM(m.cost)', 'total')
      .where('m.tenantId = :tenantId', { tenantId })
      .andWhere('m.status = :status', { status: MaintenanceStatus.COMPLETED })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }
}