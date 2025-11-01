import { Injectable, NotFoundException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan, LessThan, IsNull } from 'typeorm';
import { Driver, DriverStatus } from '../entities/driver.entity';
import { User, UserRole } from '../entities/user.entity';
import { Vehicle, VehicleStatus } from '../entities/vehicle.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { randomBytes } from 'crypto';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);
  private readonly userRepository: Repository<User>;

  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @Inject(REQUEST) private readonly request: Request,
  ) {
    // Obtenir le repository User via DataSource pour éviter les dépendances circulaires
    this.userRepository = this.dataSource.getRepository(User);
  }

  private getTenantId(): number | null {
    // Si super_admin, pas de filtre tenant
    if ((this.request as any).isSuperAdmin) {
      return null;
    }
    // Sinon, retourner tenantId (converti en number)
    const tenantId = (this.request as any).tenantId;
    return tenantId ? (typeof tenantId === 'string' ? parseInt(tenantId) : tenantId) : null;
  }

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    const tenantId = this.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for creating drivers');
    }

    // Vérifier si l'email existe déjà pour ce tenant
    const existingEmail = await this.driverRepository.findOne({
      where: { email: createDriverDto.email, tenantId },
    });
    if (existingEmail) {
      throw new BadRequestException({
        message: 'Email already exists',
        error: 'Bad Request',
        statusCode: 400,
        code: 'DUPLICATE_EMAIL',
      });
    }

    // Vérifier si le numéro de permis existe déjà pour ce tenant
    const existingLicense = await this.driverRepository.findOne({
      where: { licenseNumber: createDriverDto.licenseNumber, tenantId },
    });
    if (existingLicense) {
      throw new BadRequestException({
        message: 'License number already exists',
        error: 'Bad Request',
        statusCode: 400,
        code: 'DUPLICATE_LICENSE',
      });
    }

    const driver = this.driverRepository.create({
      ...createDriverDto,
      tenantId,
    });

    const saved = await this.driverRepository.save(driver);
    this.logger.log(`Driver created: ${saved.id} for tenant ${tenantId}`);

    // Créer automatiquement un user avec role=driver associé
    try {
      await this.createUserForDriver(saved);
    } catch (error) {
      this.logger.error(`Failed to create user for driver ${saved.id}:`, error);
      // Ne pas bloquer la création du driver si la création du user échoue
    }

    return saved;
  }

  /**
   * Créer un user automatiquement pour un driver
   */
  private async createUserForDriver(driver: Driver): Promise<User> {
    this.logger.log(`Creating user for driver ${driver.email}`);

    // Vérifier si un user existe déjà avec cet email pour ce tenant
    const existingUser = await this.userRepository.findOne({
      where: { email: driver.email, tenantId: driver.tenantId },
    });

    if (existingUser) {
      // Si le user existe, on lie simplement le driver
      if (!driver.userId) {
        driver.userId = existingUser.id;
        await this.driverRepository.save(driver);
        this.logger.log(`Linked driver ${driver.id} to existing user ${existingUser.id}`);
      }
      return existingUser;
    }

    // Créer un nouveau user avec un mot de passe temporaire
    const tempPassword = randomBytes(16).toString('hex');

    const user = this.userRepository.create({
      email: driver.email,
      password: tempPassword,
      firstName: driver.firstName,
      lastName: driver.lastName,
      phone: driver.phone || '',
      role: UserRole.DRIVER,
      tenantId: driver.tenantId,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Lier le driver au nouveau user
    driver.userId = savedUser.id;
    await this.driverRepository.save(driver);

    this.logger.log(`User created: ${savedUser.id} for driver ${driver.id} with temp password`);
    return savedUser;
  }

  async findAll(page = 1, limit = 10, status?: DriverStatus): Promise<{ data: Driver[]; total: number; page: number; limit: number }> {
    const tenantId = this.getTenantId();
    const skip = (page - 1) * limit;

    const where: any = {};
    // Filtrer par tenantId seulement si présent (super_admin voit tous les tenants)
    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.driverRepository.findAndCount({
      where,
      relations: ['vehicles', 'tenant'], // Ajouter la relation tenant
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Driver> {
    const tenantId = this.getTenantId();

    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const driver = await this.driverRepository.findOne({
      where,
      relations: ['vehicles'],
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.findOne(id);
    const tenantId = driver.tenantId; // Utiliser le tenantId du driver existant

    // Vérifier l'unicité de l'email si modifié
    if (updateDriverDto.email && updateDriverDto.email !== driver.email) {
      const existingEmail = await this.driverRepository.findOne({
        where: { email: updateDriverDto.email, tenantId },
      });
      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Vérifier l'unicité du permis si modifié
    if (updateDriverDto.licenseNumber && updateDriverDto.licenseNumber !== driver.licenseNumber) {
      const existingLicense = await this.driverRepository.findOne({
        where: { licenseNumber: updateDriverDto.licenseNumber, tenantId },
      });
      if (existingLicense) {
        throw new BadRequestException('License number already exists');
      }
    }

    Object.assign(driver, updateDriverDto);
    const updated = await this.driverRepository.save(driver);
    this.logger.log(`Driver updated: ${id}`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const driver = await this.findOne(id);
    const tenantId = driver.tenantId;

    // Vérifier qu'aucun véhicule n'est assigné
    const assignedVehicles = await this.vehicleRepository.count({
      where: { assignedDriverId: id, tenantId },
    });

    if (assignedVehicles > 0) {
      throw new BadRequestException(`Cannot delete driver with ${assignedVehicles} assigned vehicle(s)`);
    }

    await this.driverRepository.remove(driver);
    this.logger.log(`Driver deleted: ${id}`);
  }

  async assignVehicle(driverId: string, vehicleId: string): Promise<Driver> {
    const driver = await this.findOne(driverId);
    const tenantId = driver.tenantId;

    // Vérifier que le permis est valide
    const licenseExpiry = new Date(driver.licenseExpiryDate);
    if (licenseExpiry < new Date()) {
      throw new BadRequestException('Driver license is expired');
    }

    // Vérifier que le driver est actif
    if (driver.status !== DriverStatus.ACTIVE) {
      throw new BadRequestException('Driver must be active to be assigned to a vehicle');
    }

    // Vérifier que le véhicule existe et appartient au même tenant
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    // Vérifier que le véhicule n'a pas déjà un conducteur
    if (vehicle.assignedDriverId) {
      throw new BadRequestException('Vehicle is already assigned to another driver');
    }

    // Assigner le véhicule
    vehicle.assignedDriverId = driverId;
    vehicle.status = VehicleStatus.IN_USE;
    await this.vehicleRepository.save(vehicle);

    this.logger.log(`Vehicle ${vehicleId} assigned to driver ${driverId}`);
    return this.findOne(driverId);
  }

  async unassignVehicle(driverId: string, vehicleId: string): Promise<Driver> {
    const driver = await this.findOne(driverId);
    const tenantId = driver.tenantId;

    // Vérifier que le véhicule existe et appartient au même tenant
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    // Vérifier que le véhicule est bien assigné à ce conducteur
    if (vehicle.assignedDriverId !== driverId) {
      throw new BadRequestException('Vehicle is not assigned to this driver');
    }

    // Désassigner le véhicule
    vehicle.assignedDriverId = null;
    vehicle.status = VehicleStatus.AVAILABLE;
    await this.vehicleRepository.save(vehicle);

    this.logger.log(`Vehicle ${vehicleId} unassigned from driver ${driverId}`);
    return this.findOne(driverId);
  }

  async getDriverVehicles(driverId: string): Promise<Vehicle[]> {
    const driver = await this.findOne(driverId);
    const tenantId = driver.tenantId;

    return this.vehicleRepository.find({
      where: { assignedDriverId: driverId, tenantId },
    });
  }

  async getExpiringLicenses(days = 30): Promise<Driver[]> {
    const tenantId = this.getTenantId();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const query = this.driverRepository
      .createQueryBuilder('driver')
      .where('driver.licenseExpiryDate > :today', { today })
      .andWhere('driver.licenseExpiryDate <= :futureDate', { futureDate })
      .andWhere('driver.status = :status', { status: DriverStatus.ACTIVE });

    // Filtrer par tenant seulement si présent
    if (tenantId) {
      query.andWhere('driver.tenantId = :tenantId', { tenantId });
    }

    return query.orderBy('driver.licenseExpiryDate', 'ASC').getMany();
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    const tenantId = this.getTenantId();

    const where: any = { status: DriverStatus.ACTIVE };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    // Récupérer tous les drivers actifs
    const activeDrivers = await this.driverRepository.find({
      where,
      relations: ['vehicles'],
    });

    // Filtrer ceux qui n'ont aucun véhicule assigné
    return activeDrivers.filter(driver => !driver.vehicles || driver.vehicles.length === 0);
  }
}
