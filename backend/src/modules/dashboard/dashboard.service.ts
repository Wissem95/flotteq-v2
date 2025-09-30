import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from '../../entities/vehicle.entity';
import { Driver, DriverStatus } from '../../entities/driver.entity';
import { Maintenance, MaintenanceStatus } from '../maintenance/entities/maintenance.entity';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { FleetStatusDto } from './dto/fleet-status.dto';
import { CostAnalysisDto, MonthlyMaintenanceCost, MaintenanceCostByType } from './dto/cost-analysis.dto';
import { AlertDto, AlertType, AlertSeverity } from './dto/alert.dto';
import { MaintenanceStatsDto } from './dto/maintenance-stats.dto';
import { DriverStatsDto } from './dto/driver-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
  ) {}

  async getOverview(tenantId: number): Promise<DashboardOverviewDto> {
    const [
      totalVehicles,
      totalDrivers,
      totalMaintenances,
      activeVehicles,
      activeDrivers,
      upcomingMaintenances,
    ] = await Promise.all([
      this.vehicleRepository.count({ where: { tenantId } }),
      this.driverRepository.count({ where: { tenantId } }),
      this.maintenanceRepository.count({ where: { tenantId } }),
      this.vehicleRepository.count({
        where: { tenantId, status: VehicleStatus.AVAILABLE },
      }),
      this.driverRepository.count({
        where: { tenantId, status: DriverStatus.ACTIVE },
      }),
      this.maintenanceRepository.count({
        where: {
          tenantId,
          status: MaintenanceStatus.SCHEDULED,
        },
      }),
    ]);

    // Calculate total fleet value
    const vehicles = await this.vehicleRepository.find({
      where: { tenantId },
      select: ['purchasePrice', 'purchaseDate'],
    });

    const totalFleetValue = vehicles.reduce(
      (sum, v) => sum + Number(v.purchasePrice),
      0,
    );

    // Calculate average vehicle age
    const currentYear = new Date().getFullYear();
    const avgVehicleAge =
      vehicles.length > 0
        ? vehicles.reduce(
            (sum, v) =>
              sum + (currentYear - new Date(v.purchaseDate).getFullYear()),
            0,
          ) / vehicles.length
        : 0;

    return {
      totalVehicles,
      totalDrivers,
      totalMaintenances,
      activeVehicles,
      activeDrivers,
      upcomingMaintenances,
      totalFleetValue: Math.round(totalFleetValue * 100) / 100,
      avgVehicleAge: Math.round(avgVehicleAge * 10) / 10,
    };
  }

  async getFleetStatus(tenantId: number): Promise<FleetStatusDto> {
    const vehicles = await this.vehicleRepository.find({
      where: { tenantId },
      select: ['status'],
    });

    const statusCounts = vehicles.reduce(
      (acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const total = vehicles.length;
    const inUse = statusCounts[VehicleStatus.IN_USE] || 0;

    return {
      available: statusCounts[VehicleStatus.AVAILABLE] || 0,
      inUse,
      maintenance: statusCounts[VehicleStatus.MAINTENANCE] || 0,
      outOfService: statusCounts[VehicleStatus.OUT_OF_SERVICE] || 0,
      total,
      utilizationRate: total > 0 ? Math.round((inUse / total) * 100) : 0,
    };
  }

  async getCostAnalysis(tenantId: number): Promise<CostAnalysisDto> {
    // Get all maintenances
    const maintenances = await this.maintenanceRepository.find({
      where: { tenantId },
      select: ['cost', 'type', 'createdAt', 'status'],
    });

    const totalMaintenanceCost = maintenances.reduce(
      (sum, m) => sum + Number(m.cost),
      0,
    );

    // Get total fleet purchase value
    const vehicles = await this.vehicleRepository.find({
      where: { tenantId },
      select: ['purchasePrice'],
    });

    const totalFleetPurchaseValue = vehicles.reduce(
      (sum, v) => sum + Number(v.purchasePrice),
      0,
    );

    const vehicleCount = vehicles.length;
    const avgMaintenanceCostPerVehicle =
      vehicleCount > 0 ? totalMaintenanceCost / vehicleCount : 0;

    // Group by month (last 12 months)
    const monthlyMap = new Map<string, { cost: number; count: number }>();
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(now.getMonth() - 12);

    maintenances.forEach((m) => {
      const date = new Date(m.createdAt);
      if (date >= twelveMonthsAgo) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthlyMap.get(monthKey) || { cost: 0, count: 0 };
        monthlyMap.set(monthKey, {
          cost: existing.cost + Number(m.cost),
          count: existing.count + 1,
        });
      }
    });

    const monthlyMaintenanceCosts: MonthlyMaintenanceCost[] = Array.from(
      monthlyMap.entries(),
    )
      .map(([month, data]) => ({
        month,
        cost: Math.round(data.cost * 100) / 100,
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Group by type
    const typeMap = new Map<string, { cost: number; count: number }>();
    maintenances.forEach((m) => {
      const existing = typeMap.get(m.type) || { cost: 0, count: 0 };
      typeMap.set(m.type, {
        cost: existing.cost + Number(m.cost),
        count: existing.count + 1,
      });
    });

    const costsByType: MaintenanceCostByType[] = Array.from(
      typeMap.entries(),
    ).map(([type, data]) => ({
      type,
      cost: Math.round(data.cost * 100) / 100,
      count: data.count,
    }));

    // Calculate last month and current month totals
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

    const currentMonthTotal = monthlyMap.get(currentMonth)?.cost || 0;
    const lastMonthTotal = monthlyMap.get(lastMonth)?.cost || 0;

    return {
      totalMaintenanceCost: Math.round(totalMaintenanceCost * 100) / 100,
      totalFleetPurchaseValue:
        Math.round(totalFleetPurchaseValue * 100) / 100,
      avgMaintenanceCostPerVehicle:
        Math.round(avgMaintenanceCostPerVehicle * 100) / 100,
      monthlyMaintenanceCosts,
      costsByType,
      lastMonthTotal: Math.round(lastMonthTotal * 100) / 100,
      currentMonthTotal: Math.round(currentMonthTotal * 100) / 100,
    };
  }

  async getUpcomingAlerts(tenantId: number): Promise<AlertDto[]> {
    const alerts: AlertDto[] = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    const sixtyDaysFromNow = new Date(now);
    sixtyDaysFromNow.setDate(now.getDate() + 60);

    // Check driver licenses expiring
    const drivers = await this.driverRepository.find({
      where: { tenantId },
      select: [
        'id',
        'firstName',
        'lastName',
        'licenseExpiryDate',
        'medicalCertificateExpiryDate',
      ],
    });

    drivers.forEach((driver) => {
      const licenseExpiry = new Date(driver.licenseExpiryDate);
      const daysUntilExpiry = Math.ceil(
        (licenseExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
        alerts.push({
          id: `license-${driver.id}`,
          type: AlertType.LICENSE_EXPIRING,
          severity:
            daysUntilExpiry <= 7
              ? AlertSeverity.CRITICAL
              : daysUntilExpiry <= 15
                ? AlertSeverity.HIGH
                : AlertSeverity.MEDIUM,
          title: 'License Expiring Soon',
          message: `${driver.firstName} ${driver.lastName}'s license expires in ${daysUntilExpiry} days`,
          entityId: driver.id,
          entityType: 'driver',
          dueDate: licenseExpiry,
          daysUntilDue: daysUntilExpiry,
        });
      }

      // Check medical certificate
      if (driver.medicalCertificateExpiryDate) {
        const medicalExpiry = new Date(driver.medicalCertificateExpiryDate);
        const daysUntilMedical = Math.ceil(
          (medicalExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntilMedical <= 30 && daysUntilMedical >= 0) {
          alerts.push({
            id: `medical-${driver.id}`,
            type: AlertType.MEDICAL_CERTIFICATE_EXPIRING,
            severity:
              daysUntilMedical <= 7
                ? AlertSeverity.CRITICAL
                : daysUntilMedical <= 15
                  ? AlertSeverity.HIGH
                  : AlertSeverity.MEDIUM,
            title: 'Medical Certificate Expiring',
            message: `${driver.firstName} ${driver.lastName}'s medical certificate expires in ${daysUntilMedical} days`,
            entityId: driver.id,
            entityType: 'driver',
            dueDate: medicalExpiry,
            daysUntilDue: daysUntilMedical,
          });
        }
      }
    });

    // Check upcoming maintenances
    const upcomingMaintenances = await this.maintenanceRepository
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.vehicle', 'vehicle')
      .where('maintenance.tenantId = :tenantId', { tenantId })
      .andWhere('maintenance.status = :status', {
        status: MaintenanceStatus.SCHEDULED,
      })
      .andWhere('maintenance.scheduledDate <= :maxDate', {
        maxDate: sixtyDaysFromNow,
      })
      .andWhere('maintenance.scheduledDate >= :minDate', { minDate: now })
      .getMany();

    upcomingMaintenances.forEach((maintenance) => {
      const scheduledDate = new Date(maintenance.scheduledDate);
      const daysUntil = Math.ceil(
        (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      alerts.push({
        id: `maintenance-${maintenance.id}`,
        type: AlertType.MAINTENANCE_DUE,
        severity:
          daysUntil <= 3
            ? AlertSeverity.HIGH
            : daysUntil <= 7
              ? AlertSeverity.MEDIUM
              : AlertSeverity.LOW,
        title: 'Maintenance Due Soon',
        message: `${maintenance.type} for vehicle ${maintenance.vehicle?.registration || 'unknown'} scheduled in ${daysUntil} days`,
        entityId: maintenance.id,
        entityType: 'maintenance',
        dueDate: scheduledDate,
        daysUntilDue: daysUntil,
      });
    });

    // Sort by severity and days until due
    const severityOrder = {
      [AlertSeverity.CRITICAL]: 0,
      [AlertSeverity.HIGH]: 1,
      [AlertSeverity.MEDIUM]: 2,
      [AlertSeverity.LOW]: 3,
    };

    return alerts.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return (a.daysUntilDue || 999) - (b.daysUntilDue || 999);
    });
  }

  async getMaintenanceStats(tenantId: number): Promise<MaintenanceStatsDto> {
    const maintenances = await this.maintenanceRepository.find({
      where: { tenantId },
      select: [
        'status',
        'cost',
        'type',
        'scheduledDate',
        'completedDate',
      ],
    });

    const statusCounts = maintenances.reduce(
      (acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalCost = maintenances.reduce(
      (sum, m) => sum + Number(m.cost),
      0,
    );
    const avgCost =
      maintenances.length > 0 ? totalCost / maintenances.length : 0;

    // Find most common type
    const typeCounts = maintenances.reduce(
      (acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostCommonType =
      Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Calculate average days to complete
    const completedWithDates = maintenances.filter(
      (m) => m.status === MaintenanceStatus.COMPLETED && m.completedDate && m.scheduledDate,
    );

    const avgDaysToComplete =
      completedWithDates.length > 0
        ? completedWithDates.reduce((sum, m) => {
            const days = Math.ceil(
              (new Date(m.completedDate!).getTime() -
                new Date(m.scheduledDate).getTime()) /
                (1000 * 60 * 60 * 24),
            );
            return sum + days;
          }, 0) / completedWithDates.length
        : 0;

    return {
      totalCompleted: statusCounts[MaintenanceStatus.COMPLETED] || 0,
      totalScheduled: statusCounts[MaintenanceStatus.SCHEDULED] || 0,
      totalInProgress: statusCounts[MaintenanceStatus.IN_PROGRESS] || 0,
      totalCancelled: statusCounts[MaintenanceStatus.CANCELLED] || 0,
      avgCost: Math.round(avgCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      mostCommonType,
      avgDaysToComplete: Math.round(avgDaysToComplete * 10) / 10,
    };
  }

  async getDriverStats(tenantId: number): Promise<DriverStatsDto> {
    const drivers = await this.driverRepository.find({
      where: { tenantId },
      relations: ['vehicles'],
      select: ['id', 'status', 'licenseExpiryDate'],
    });

    const statusCounts = drivers.reduce(
      (acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Check licenses expiring within 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const driversWithExpiringSoon = drivers.filter((d) => {
      const expiryDate = new Date(d.licenseExpiryDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= now;
    }).length;

    const driversWithVehicles = drivers.filter(
      (d) => d.vehicles && d.vehicles.length > 0,
    ).length;

    return {
      totalActive: statusCounts[DriverStatus.ACTIVE] || 0,
      totalInactive: statusCounts[DriverStatus.INACTIVE] || 0,
      totalSuspended: statusCounts[DriverStatus.SUSPENDED] || 0,
      totalOnLeave: statusCounts[DriverStatus.ON_LEAVE] || 0,
      total: drivers.length,
      driversWithExpiringSoon,
      driversWithVehicles,
      driversWithoutVehicles: drivers.length - driversWithVehicles,
    };
  }
}