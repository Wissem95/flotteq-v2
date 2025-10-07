import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { Document, DocumentEntityType } from '../../entities/document.entity';
import { Maintenance, MaintenanceStatus } from '../maintenance/entities/maintenance.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { VehicleStatsDto, VehicleStatusCount } from './dto/vehicle-stats.dto';
import {
  VehicleTimelineDto,
  TimelineItemDto,
  TimelineItemType,
} from './dto/vehicle-timeline.dto';
import {
  VehicleCostAnalysisDto,
  MaintenanceCostByTypeDto,
} from './dto/vehicle-cost-analysis.dto';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
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

  async getTimeline(
    vehicleId: string,
    tenantId: number,
    limit = 50,
  ): Promise<VehicleTimelineDto> {
    // Vérifier que le véhicule existe
    const vehicle = await this.findOne(vehicleId, tenantId);

    const timelineItems: TimelineItemDto[] = [];

    // 1. Récupérer les maintenances
    const maintenances = await this.maintenanceRepository.find({
      where: { vehicleId, tenantId },
      order: { scheduledDate: 'DESC' },
      take: limit,
    });

    maintenances.forEach((m) => {
      timelineItems.push({
        type: TimelineItemType.MAINTENANCE,
        date: m.scheduledDate,
        description: `Maintenance ${m.type}: ${m.description}`,
        metadata: {
          maintenanceId: m.id,
          type: m.type,
          status: m.status,
          cost: m.actualCost || m.estimatedCost,
          performedBy: m.performedBy,
        },
      });
    });

    // 2. Récupérer les documents
    const documents = await this.documentRepository.find({
      where: {
        entityId: vehicleId,
        entityType: DocumentEntityType.VEHICLE,
        tenantId,
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    documents.forEach((d) => {
      timelineItems.push({
        type: TimelineItemType.DOCUMENT,
        date: d.createdAt,
        description: `Document ajouté: ${d.fileName}`,
        metadata: {
          documentId: d.id,
          fileName: d.fileName,
          fileUrl: d.fileUrl,
          mimeType: d.mimeType,
        },
      });
    });

    // 3. Ajouter événement de création
    timelineItems.push({
      type: TimelineItemType.CREATION,
      date: vehicle.createdAt,
      description: `Véhicule créé - ${vehicle.brand} ${vehicle.model} (${vehicle.registration})`,
      metadata: {
        purchasePrice: vehicle.purchasePrice,
        purchaseDate: vehicle.purchaseDate,
      },
    });

    // Trier par date décroissante
    timelineItems.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Limiter le nombre d'items
    const limitedItems = timelineItems.slice(0, limit);

    return {
      vehicleId,
      items: limitedItems,
      totalEvents: timelineItems.length,
    };
  }

  async getCostAnalysis(
    vehicleId: string,
    tenantId: number,
  ): Promise<VehicleCostAnalysisDto> {
    // Vérifier que le véhicule existe
    const vehicle = await this.findOne(vehicleId, tenantId);

    // Récupérer toutes les maintenances complétées
    const completedMaintenances = await this.maintenanceRepository.find({
      where: {
        vehicleId,
        tenantId,
        status: MaintenanceStatus.COMPLETED,
      },
    });

    // Calculer le coût total des maintenances
    const totalMaintenanceCost = completedMaintenances.reduce(
      (sum, m) => sum + parseFloat((m.actualCost || m.estimatedCost).toString()),
      0,
    );

    const totalMaintenanceCount = completedMaintenances.length;
    const averageMaintenanceCost =
      totalMaintenanceCount > 0 ? totalMaintenanceCost / totalMaintenanceCount : 0;

    // Grouper par type de maintenance
    const costsByTypeMap = new Map<string, MaintenanceCostByTypeDto>();
    completedMaintenances.forEach((m) => {
      const existing = costsByTypeMap.get(m.type);
      const cost = parseFloat((m.actualCost || m.estimatedCost).toString());

      if (existing) {
        existing.totalCost += cost;
        existing.count += 1;
      } else {
        costsByTypeMap.set(m.type, {
          type: m.type,
          totalCost: cost,
          count: 1,
        });
      }
    });

    const costsByType = Array.from(costsByTypeMap.values());

    // Coût total de possession
    const purchasePrice = parseFloat(vehicle.purchasePrice.toString());
    const totalOwnershipCost = purchasePrice + totalMaintenanceCost;

    // Coût par kilomètre
    const kmParcourus = vehicle.currentKm - (vehicle.initialMileage || 0);
    const costPerKm = kmParcourus > 0 ? totalOwnershipCost / kmParcourus : undefined;

    return {
      vehicleId,
      purchasePrice,
      totalMaintenanceCost,
      totalMaintenanceCount,
      averageMaintenanceCost,
      totalOwnershipCost,
      costsByType,
      costPerKm,
    };
  }

  async uploadPhotos(
    vehicleId: string,
    files: Express.Multer.File[],
    tenantId: number,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(vehicleId, tenantId);

    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Limite de 10 photos par véhicule
    const currentPhotos = vehicle.photos || [];
    if (currentPhotos.length + files.length > 10) {
      throw new BadRequestException(
        `Maximum 10 photos par véhicule. Actuellement: ${currentPhotos.length}`,
      );
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'vehicles', vehicleId);

    // Créer le dossier s'il n'existe pas
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create upload directory: ${uploadDir}`, error);
      throw new BadRequestException('Erreur lors de la création du dossier upload');
    }

    const photoUrls: string[] = [];

    // Traiter chaque fichier avec Sharp
    for (const file of files) {
      try {
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const filepath = path.join(uploadDir, filename);
        const thumbnailPath = path.join(uploadDir, `thumb-${filename}`);

        // Redimensionner l'image principale (max 1920x1080)
        await sharp(file.buffer)
          .resize(1920, 1080, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toFile(filepath);

        // Créer une miniature (300x200)
        await sharp(file.buffer)
          .resize(300, 200, {
            fit: 'cover',
          })
          .webp({ quality: 80 })
          .toFile(thumbnailPath);

        // URL relative pour stockage en DB
        const photoUrl = `/uploads/vehicles/${vehicleId}/${filename}`;
        photoUrls.push(photoUrl);

        this.logger.log(`Photo uploaded: ${photoUrl}`);
      } catch (error) {
        this.logger.error(`Failed to process image: ${file.originalname}`, error);
        throw new BadRequestException(`Erreur lors du traitement de l'image ${file.originalname}`);
      }
    }

    // Mettre à jour le véhicule avec les nouvelles URLs
    vehicle.photos = [...currentPhotos, ...photoUrls];
    const updatedVehicle = await this.vehicleRepository.save(vehicle);

    this.logger.log(`${photoUrls.length} photo(s) added to vehicle ${vehicleId}`);
    return updatedVehicle;
  }

  async deletePhoto(
    vehicleId: string,
    photoUrl: string,
    tenantId: number,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(vehicleId, tenantId);

    if (!vehicle.photos || vehicle.photos.length === 0) {
      throw new NotFoundException('Aucune photo trouvée pour ce véhicule');
    }

    const photoIndex = vehicle.photos.findIndex((url) => url === photoUrl);
    if (photoIndex === -1) {
      throw new NotFoundException('Photo non trouvée');
    }

    // Supprimer le fichier physique
    try {
      const filename = path.basename(photoUrl);
      const filepath = path.join(process.cwd(), 'uploads', 'vehicles', vehicleId, filename);
      const thumbnailPath = path.join(process.cwd(), 'uploads', 'vehicles', vehicleId, `thumb-${filename}`);

      await fs.unlink(filepath);
      await fs.unlink(thumbnailPath).catch(() => {
        // Ignore si le thumbnail n'existe pas
      });

      this.logger.log(`Photo deleted: ${photoUrl}`);
    } catch (error) {
      this.logger.error(`Failed to delete photo file: ${photoUrl}`, error);
      // Continue quand même pour nettoyer la DB
    }

    // Retirer l'URL du tableau
    vehicle.photos.splice(photoIndex, 1);
    const updatedVehicle = await this.vehicleRepository.save(vehicle);

    this.logger.log(`Photo removed from vehicle ${vehicleId}`);
    return updatedVehicle;
  }
}
