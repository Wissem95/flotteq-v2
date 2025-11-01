import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Trip, TripStatus } from '../../entities/trip.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Driver } from '../../entities/driver.entity';
import { MileageHistory, MileageSource } from '../../entities/mileage-history.entity';
import { ReportsService } from '../reports/reports.service';
import { ReportType } from '../../entities/report.entity';
import { StartTripDto } from './dto/start-trip.dto';
import { EndTripDto } from './dto/end-trip.dto';
import { TripFilterDto } from './dto/trip-filter.dto';
import { MonthlyStatsResponseDto } from './dto/monthly-stats-response.dto';
import { DriversPerformanceResponseDto } from './dto/drivers-performance-response.dto';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(MileageHistory)
    private readonly mileageHistoryRepository: Repository<MileageHistory>,
    private readonly reportsService: ReportsService,
  ) {}

  /**
   * Démarrer un nouveau trip
   */
  async startTrip(dto: StartTripDto, driverId: string, tenantId: number): Promise<Trip> {
    // 1. Vérifier qu'il n'y a pas de trip IN_PROGRESS
    const existingTrip = await this.tripRepository.findOne({
      where: { driverId, status: TripStatus.IN_PROGRESS },
    });

    if (existingTrip) {
      throw new BadRequestException('Trip already in progress');
    }

    // 2. Vérifier que le véhicule est assigné au driver
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: dto.vehicleId, assignedDriverId: driverId, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not assigned to this driver');
    }

    // 3. Logger warning si km différent du km actuel
    if (vehicle.currentKm && Math.abs(dto.startKm - vehicle.currentKm) > 100) {
      this.logger.warn(
        `Start km (${dto.startKm}) differs significantly from vehicle current km (${vehicle.currentKm}) for vehicle ${vehicle.id}`,
      );
    }

    // 4. Créer le trip
    const trip = this.tripRepository.create({
      ...dto,
      driverId,
      tenantId,
      status: TripStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    const savedTrip = await this.tripRepository.save(trip);

    this.logger.log(
      `Trip ${savedTrip.id} started by driver ${driverId} for vehicle ${dto.vehicleId}`,
    );

    return savedTrip;
  }

  /**
   * Terminer un trip
   */
  async endTrip(tripId: string, dto: EndTripDto, driverId: string): Promise<Trip> {
    // 1. Vérifier que le trip existe et est IN_PROGRESS
    const trip = await this.tripRepository.findOne({
      where: { id: tripId, driverId, status: TripStatus.IN_PROGRESS },
      relations: ['vehicle', 'driver'],
    });

    if (!trip) {
      throw new NotFoundException('Trip not found or already completed');
    }

    // 2. Validation km
    if (dto.endKm < trip.startKm) {
      throw new BadRequestException('End km cannot be less than start km');
    }

    // 3. Calculer distance et durée
    const distanceKm = dto.endKm - trip.startKm;
    const endedAt = new Date();
    const durationMinutes = Math.round(
      (endedAt.getTime() - new Date(trip.startedAt).getTime()) / 60000,
    );

    // 4. SYNC KILOMÉTRAGE du véhicule
    trip.vehicle.currentKm = dto.endKm;
    trip.vehicle.mileage = dto.endKm; // Sync hybride
    await this.vehicleRepository.save(trip.vehicle);

    // 5. Créer MileageHistory
    await this.mileageHistoryRepository.save({
      vehicleId: trip.vehicleId,
      mileage: dto.endKm,
      previousMileage: trip.startKm,
      difference: distanceKm,
      source: MileageSource.MANUAL,
      notes: `Trip ${tripId} - Driver ${trip.driver.firstName} ${trip.driver.lastName}`,
      tenantId: trip.tenantId,
    });

    // 6. Détecter nouveaux défauts critiques et créer rapport si nécessaire
    const newDefects =
      dto.endDefects?.filter(
        (ed) =>
          ed.severity === 'severe' &&
          !trip.startDefects?.some((sd) => sd.id === ed.id),
      ) || [];

    if (newDefects.length > 0) {
      this.logger.warn(
        `${newDefects.length} new severe defects detected at end of trip ${tripId}`,
      );

      await this.reportsService.create(
        {
          vehicleId: trip.vehicleId,
          type: ReportType.DAMAGE,
          description: `Nouveaux défauts critiques détectés après trip ${tripId}`,
          notes: newDefects
            .map((d) => `${d.type} - ${d.location}: ${d.description}`)
            .join('\n'),
        },
        driverId,
        trip.tenantId,
      );
    }

    // 7. Finaliser le trip
    Object.assign(trip, {
      ...dto,
      endedAt,
      distanceKm,
      durationMinutes,
      status: TripStatus.COMPLETED,
    });

    const completedTrip = await this.tripRepository.save(trip);

    this.logger.log(
      `Trip ${tripId} completed: ${distanceKm} km in ${durationMinutes} minutes`,
    );

    return completedTrip;
  }

  /**
   * Obtenir le trip en cours du driver
   */
  async getCurrentTrip(driverId: string): Promise<Trip | null> {
    return await this.tripRepository.findOne({
      where: { driverId, status: TripStatus.IN_PROGRESS },
      relations: ['vehicle'],
    });
  }

  /**
   * Obtenir l'historique des trips du driver
   */
  async getTripHistory(driverId: string, filterDto?: TripFilterDto) {
    const { page = 1, limit = 10 } = filterDto || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.vehicle', 'vehicle')
      .where('trip.driverId = :driverId', { driverId })
      .orderBy('trip.startedAt', 'DESC');

    // Support des deux formats : dateFrom/dateTo ET startDate/endDate
    const effectiveStartDate = filterDto?.startDate || filterDto?.dateFrom;
    const effectiveEndDate = filterDto?.endDate || filterDto?.dateTo;

    if (effectiveStartDate) {
      queryBuilder.andWhere('trip.startedAt >= :startDate', { startDate: effectiveStartDate });
    }

    if (effectiveEndDate) {
      queryBuilder.andWhere('trip.startedAt <= :endDate', { endDate: effectiveEndDate });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Obtenir un trip par son ID
   */
  async getTripById(tripId: string, tenantId: number): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId, tenantId },
      relations: ['vehicle', 'driver'],
    });

    if (!trip) {
      throw new NotFoundException(`Trip ${tripId} not found`);
    }

    return trip;
  }

  /**
   * Obtenir tous les trips (admin)
   */
  async getAllTrips(tenantId: number, filterDto?: TripFilterDto) {
    const {
      page = 1,
      limit = 10,
      driverId,
      vehicleId,
      status,
    } = filterDto || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.vehicle', 'vehicle')
      .leftJoinAndSelect('trip.driver', 'driver')
      .where('trip.tenantId = :tenantId', { tenantId })
      .orderBy('trip.startedAt', 'DESC');

    if (driverId) {
      queryBuilder.andWhere('trip.driverId = :driverId', { driverId });
    }

    if (vehicleId) {
      queryBuilder.andWhere('trip.vehicleId = :vehicleId', { vehicleId });
    }

    if (status) {
      queryBuilder.andWhere('trip.status = :status', { status });
    }

    // Support des deux formats : dateFrom/dateTo ET startDate/endDate
    const effectiveStartDate = filterDto?.startDate || filterDto?.dateFrom;
    const effectiveEndDate = filterDto?.endDate || filterDto?.dateTo;

    if (effectiveStartDate) {
      queryBuilder.andWhere('trip.startedAt >= :startDate', { startDate: effectiveStartDate });
    }

    if (effectiveEndDate) {
      queryBuilder.andWhere('trip.startedAt <= :endDate', { endDate: effectiveEndDate });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Obtenir les statistiques mensuelles
   */
  async getMonthlyStats(
    tenantId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<MonthlyStatsResponseDto> {
    const params: any[] = [tenantId];
    let dateFilter = '';

    if (startDate) {
      params.push(startDate);
      dateFilter += ` AND "startedAt" >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      dateFilter += ` AND "startedAt" <= $${params.length}`;
    }

    const query = `
      SELECT
        TO_CHAR(DATE_TRUNC('month', "startedAt"), 'YYYY-MM') as month,
        TO_CHAR(DATE_TRUNC('month', "startedAt"), 'Mon YYYY') as "monthLabel",
        COUNT(*)::int as "tripCount",
        COALESCE(SUM("distanceKm"), 0)::int as "totalKm",
        COALESCE(AVG("startFuelLevel" - COALESCE("endFuelLevel", "startFuelLevel")), 0)::int as "avgFuelConsumption"
      FROM trips
      WHERE "tenantId" = $1
        AND status = 'completed'
        ${dateFilter}
      GROUP BY DATE_TRUNC('month', "startedAt")
      ORDER BY month DESC
      LIMIT 12
    `;

    const rawData = await this.tripRepository.query(query, params);

    return {
      data: rawData.map((row: any) => ({
        month: row.month,
        monthLabel: row.monthLabel,
        tripCount: row.tripCount,
        totalKm: row.totalKm,
        avgFuelConsumption: row.avgFuelConsumption,
      })),
    };
  }

  /**
   * Rapport de performance des conducteurs
   */
  async getDriversPerformance(
    tenantId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<DriversPerformanceResponseDto> {
    const params: any[] = [tenantId];
    let dateFilter = '';

    if (startDate) {
      params.push(startDate);
      dateFilter += ` AND t."startedAt" >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      dateFilter += ` AND t."startedAt" <= $${params.length}`;
    }

    const query = `
      SELECT
        d.id as "driverId",
        d."firstName" || ' ' || d."lastName" as "driverName",
        COUNT(t.id)::int as "tripCount",
        COALESCE(SUM(t."distanceKm"), 0)::int as "totalKm",
        COALESCE(AVG(t."distanceKm"), 0)::int as "avgKmPerTrip",
        COALESCE(SUM(
          jsonb_array_length(COALESCE(t."startDefects", '[]'::jsonb)) +
          jsonb_array_length(COALESCE(t."endDefects", '[]'::jsonb))
        ), 0)::int as "totalDefects"
      FROM drivers d
      LEFT JOIN trips t ON t."driverId" = d.id AND t.status = 'completed'
      WHERE d."tenantId" = $1${dateFilter}
      GROUP BY d.id, d."firstName", d."lastName"
      HAVING COUNT(t.id) > 0
      ORDER BY "totalKm" DESC
    `;

    const rawData = await this.tripRepository.query(query, params);

    return { data: rawData };
  }
}
