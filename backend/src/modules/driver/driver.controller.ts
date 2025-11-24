import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UploadedFiles,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { Request } from 'express';
import { DriverGuard } from '../../common/guards/driver.guard';
import { DriversService } from '../drivers.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { DocumentsService } from '../../documents/documents.service';
import { ReportsService } from '../reports/reports.service';
import { TripsService } from '../trips/trips.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Maintenance,
  MaintenanceStatus,
  MaintenanceType,
} from '../maintenance/entities/maintenance.entity';
import { Driver } from '../../entities/driver.entity';
import { Document, DocumentEntityType } from '../../entities/document.entity';
import { DriverResponseDto, DriverVehicleDto } from './dto/driver-response.dto';
import { VehicleReportDto, ReportType } from './dto/vehicle-report.dto';
import { UpdateDriverProfileDto } from './dto/update-driver-profile.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';
import { multerConfig } from '../vehicles/config/multer.config';
import { StartTripDto } from '../trips/dto/start-trip.dto';
import { EndTripDto } from '../trips/dto/end-trip.dto';
import { TripFilterDto } from '../trips/dto/trip-filter.dto';
import {
  MileageHistory,
  MileageSource,
} from '../../entities/mileage-history.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@ApiTags('Driver API')
@ApiBearerAuth()
@Controller('driver')
@UseGuards(DriverGuard)
export class DriverController {
  constructor(
    private readonly driversService: DriversService,
    private readonly vehiclesService: VehiclesService,
    private readonly documentsService: DocumentsService,
    private readonly reportsService: ReportsService,
    private readonly tripsService: TripsService,
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(MileageHistory)
    private readonly mileageHistoryRepository: Repository<MileageHistory>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  /**
   * Récupérer le profil du driver connecté
   */
  @Get('profile')
  @ApiOperation({ summary: 'Get driver profile' })
  @ApiResponse({
    status: 200,
    description: 'Driver profile retrieved',
    type: DriverResponseDto,
  })
  async getProfile(@Req() req: Request): Promise<DriverResponseDto> {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Récupérer le véhicule assigné
    const vehicles = await this.driversService.getDriverVehicles(driver.id);
    const assignedVehicle = vehicles.length > 0 ? vehicles[0] : null;

    let vehicleDto: DriverVehicleDto | null = null;
    if (assignedVehicle) {
      vehicleDto = {
        id: assignedVehicle.id,
        registration: assignedVehicle.registration,
        brand: assignedVehicle.brand,
        model: assignedVehicle.model,
        year: assignedVehicle.year,
        currentKm: assignedVehicle.currentKm,
        status: assignedVehicle.status,
        lastTechnicalInspection: assignedVehicle.lastTechnicalInspection,
        nextTechnicalInspection: assignedVehicle.nextTechnicalInspection,
        photos: assignedVehicle.photos,
      };
    }

    return {
      id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseExpiryDate: driver.licenseExpiryDate,
      status: driver.status,
      assignedVehicle: vehicleDto,
      createdAt: driver.createdAt,
    };
  }

  /**
   * Récupérer le véhicule assigné au driver
   */
  @Get('vehicle')
  @ApiOperation({ summary: 'Get assigned vehicle' })
  @ApiResponse({ status: 200, description: 'Assigned vehicle retrieved' })
  async getVehicle(@Req() req: Request) {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    const vehicles = await this.driversService.getDriverVehicles(driver.id);

    if (vehicles.length === 0) {
      return null;
    }

    return vehicles[0];
  }

  /**
   * Récupérer les documents du driver et de son véhicule
   */
  @Get('documents')
  @ApiOperation({ summary: 'Get driver and vehicle documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved' })
  async getDocuments(@Req() req: Request): Promise<Document[]> {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Récupérer documents du driver
    const driverDocs = await this.documentsService.findAll(
      user.tenantId,
      DocumentEntityType.DRIVER,
      driver.id,
    );

    // Récupérer le véhicule assigné
    const vehicles = await this.driversService.getDriverVehicles(driver.id);

    let vehicleDocs: Document[] = [];
    if (vehicles.length > 0) {
      vehicleDocs = await this.documentsService.findAll(
        user.tenantId,
        DocumentEntityType.VEHICLE,
        vehicles[0].id,
      );
    }

    return [...driverDocs, ...vehicleDocs];
  }

  /**
   * Signaler un problème sur le véhicule
   */
  @Post('reports')
  @ApiOperation({ summary: 'Report vehicle issue' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  async reportIssue(@Req() req: Request, @Body() reportDto: VehicleReportDto) {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Récupérer le véhicule assigné
    const vehicles = await this.driversService.getDriverVehicles(driver.id);

    if (vehicles.length === 0) {
      throw new BadRequestException('No vehicle assigned');
    }

    const vehicle = vehicles[0];

    // Créer le report via ReportsService
    const report = await this.reportsService.create(
      {
        vehicleId: vehicle.id,
        type: reportDto.type as any, // ReportType from entity
        description: reportDto.description,
        notes: reportDto.notes,
      },
      driver.id,
      user.tenantId,
    );

    return {
      message: 'Report submitted successfully',
      reportId: report.id,
      status: report.status,
    };
  }

  /**
   * Récupérer les reports du driver
   */
  @Get('reports')
  @ApiOperation({ summary: 'Get driver reports' })
  @ApiResponse({ status: 200, description: 'Driver reports retrieved' })
  async getReports(@Req() req: Request) {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    return this.reportsService.findByDriver(driver.id, user.tenantId);
  }

  /**
   * Upload photos de check du véhicule
   */
  @Post('photos')
  @UseInterceptors(FilesInterceptor('photos', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload vehicle check photos' })
  @ApiResponse({ status: 201, description: 'Photos uploaded successfully' })
  async uploadPhotos(
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const user = (req as any).user;

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Récupérer le véhicule assigné
    const vehicles = await this.driversService.getDriverVehicles(driver.id);

    if (vehicles.length === 0) {
      throw new BadRequestException('No vehicle assigned');
    }

    const vehicle = vehicles[0];

    // Utiliser le service de véhicules pour uploader les photos
    const updatedVehicle = await this.vehiclesService.uploadPhotos(
      vehicle.id,
      files,
      user.tenantId,
    );

    return {
      message: 'Photos uploaded successfully',
      photosCount: files.length,
      vehicleId: updatedVehicle.id,
    };
  }

  /**
   * Upload une seule photo pour les trips
   */
  @Post('photos/single')
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload single photo for trip' })
  @ApiResponse({ status: 201, description: 'Photo uploaded successfully' })
  async uploadSinglePhoto(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = (req as any).user;

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Créer le répertoire pour les photos de trips
    const uploadDir = path.join(process.cwd(), 'uploads', 'trips', driver.id);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    // Sauvegarder le fichier
    fs.writeFileSync(filePath, file.buffer);

    // Générer l'URL relative
    const photoUrl = `/uploads/trips/${driver.id}/${fileName}`;

    return {
      message: 'Photo uploaded successfully',
      photoUrl,
    };
  }

  /**
   * Upload photos pour un signalement
   */
  @Post('reports/:reportId/photos')
  @UseInterceptors(FilesInterceptor('photos', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload photos for a report' })
  @ApiResponse({ status: 201, description: 'Photos uploaded successfully' })
  async uploadReportPhotos(
    @Req() req: Request,
    @Param('reportId') reportId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const user = (req as any).user;

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Upload photos via le service
    const updatedReport = await this.reportsService.addPhotos(
      reportId,
      files,
      driver.id,
      user.tenantId,
    );

    return {
      message: 'Photos uploaded successfully',
      photosCount: files.length,
      reportId: updatedReport.id,
    };
  }

  /**
   * Mettre à jour le profil du driver
   */
  @Patch('profile')
  @ApiOperation({ summary: 'Update driver profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Req() req: Request,
    @Body() updateDto: UpdateDriverProfileDto,
  ) {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Mettre à jour les champs
    Object.assign(driver, updateDto);
    await this.driverRepository.save(driver);

    return {
      message: 'Profile updated successfully',
      driver: {
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        phone: driver.phone,
        address: driver.address,
        city: driver.city,
        postalCode: driver.postalCode,
        emergencyContact: driver.emergencyContact,
        emergencyPhone: driver.emergencyPhone,
        birthDate: driver.birthDate,
        profilePhotoUrl: driver.profilePhotoUrl,
        profilePhotoThumbnail: driver.profilePhotoThumbnail,
      },
    };
  }

  /**
   * Upload photo de profil
   */
  @Post('profile/photo')
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload driver profile photo' })
  @ApiResponse({ status: 200, description: 'Photo uploaded successfully' })
  async uploadProfilePhoto(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = (req as any).user;

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Supprimer l'ancienne photo si elle existe
    if (driver.profilePhotoUrl) {
      const oldPhotoPath = path.join(process.cwd(), driver.profilePhotoUrl);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }
    if (driver.profilePhotoThumbnail) {
      const oldThumbnailPath = path.join(
        process.cwd(),
        driver.profilePhotoThumbnail,
      );
      if (fs.existsSync(oldThumbnailPath)) {
        fs.unlinkSync(oldThumbnailPath);
      }
    }

    // Générer les chemins pour la photo et la miniature
    const uploadDir = path.join(
      process.cwd(),
      'uploads',
      'drivers',
      'profiles',
      driver.id,
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const thumbFileName = `thumb-${fileName}`;
    const photoPath = path.join(uploadDir, fileName);
    const thumbPath = path.join(uploadDir, thumbFileName);

    // Sauvegarder la photo originale
    fs.writeFileSync(photoPath, file.buffer);

    // Créer une miniature (200x200)
    await sharp(file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .toFile(thumbPath);

    // URL relatives pour la base de données
    const photoUrl = `/uploads/drivers/profiles/${driver.id}/${fileName}`;
    const thumbUrl = `/uploads/drivers/profiles/${driver.id}/${thumbFileName}`;

    // Mettre à jour le driver
    driver.profilePhotoUrl = photoUrl;
    driver.profilePhotoThumbnail = thumbUrl;
    await this.driverRepository.save(driver);

    return {
      message: 'Photo uploaded successfully',
      photoUrl,
      thumbUrl,
    };
  }

  /**
   * Supprimer la photo de profil
   */
  @Delete('profile/photo')
  @ApiOperation({ summary: 'Delete driver profile photo' })
  @ApiResponse({ status: 200, description: 'Photo deleted successfully' })
  async deleteProfilePhoto(@Req() req: Request) {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Supprimer les fichiers
    if (driver.profilePhotoUrl) {
      const photoPath = path.join(process.cwd(), driver.profilePhotoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    if (driver.profilePhotoThumbnail) {
      const thumbPath = path.join(process.cwd(), driver.profilePhotoThumbnail);
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    }

    // Mettre à jour le driver
    driver.profilePhotoUrl = null;
    driver.profilePhotoThumbnail = null;
    await this.driverRepository.save(driver);

    return { message: 'Photo deleted successfully' };
  }

  /**
   * Mettre à jour le kilométrage du véhicule assigné
   */
  @Post('vehicle/mileage')
  @ApiOperation({ summary: 'Update vehicle mileage' })
  @ApiResponse({ status: 200, description: 'Mileage updated successfully' })
  async updateVehicleMileage(
    @Req() req: Request,
    @Body() updateDto: UpdateMileageDto,
  ) {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Récupérer le véhicule assigné
    const vehicles = await this.driversService.getDriverVehicles(driver.id);

    if (vehicles.length === 0) {
      throw new BadRequestException('No vehicle assigned');
    }

    const vehicle = vehicles[0];

    // Validation : nouveau kilométrage doit être supérieur à l'ancien
    if (updateDto.mileage <= vehicle.currentKm) {
      throw new BadRequestException(
        `New mileage (${updateDto.mileage} km) must be greater than current mileage (${vehicle.currentKm} km)`,
      );
    }

    // Validation anti-fraude : pas plus de 10,000 km d'écart
    const difference = updateDto.mileage - vehicle.currentKm;
    if (difference > 10000) {
      throw new BadRequestException(
        `Mileage difference too large (${difference} km). Maximum allowed: 10,000 km. Please contact your fleet manager.`,
      );
    }

    const previousMileage = vehicle.currentKm;

    // Créer l'historique de kilométrage
    const mileageHistory = this.mileageHistoryRepository.create({
      vehicleId: vehicle.id,
      mileage: updateDto.mileage,
      previousMileage,
      difference,
      source: MileageSource.MANUAL,
      notes:
        updateDto.notes ||
        `Updated by driver ${driver.firstName} ${driver.lastName}`,
      tenantId: user.tenantId,
    });

    await this.mileageHistoryRepository.save(mileageHistory);

    // Mettre à jour le véhicule (SYNC currentKm et mileage)
    vehicle.currentKm = updateDto.mileage;
    vehicle.mileage = updateDto.mileage; // Synchronisation hybride
    await this.vehicleRepository.save(vehicle);

    return {
      message: 'Mileage updated successfully',
      previousMileage,
      newMileage: updateDto.mileage,
      difference,
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.registration,
    };
  }

  /**
   * Récupérer l'historique du kilométrage du véhicule assigné
   */
  @Get('vehicle/mileage-history')
  @ApiOperation({ summary: 'Get vehicle mileage history' })
  @ApiResponse({ status: 200, description: 'Mileage history retrieved' })
  async getVehicleMileageHistory(@Req() req: Request) {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Récupérer le véhicule assigné
    const vehicles = await this.driversService.getDriverVehicles(driver.id);

    if (vehicles.length === 0) {
      throw new BadRequestException('No vehicle assigned');
    }

    const vehicle = vehicles[0];

    // Récupérer l'historique
    const history = await this.mileageHistoryRepository.find({
      where: { vehicleId: vehicle.id, tenantId: user.tenantId },
      order: { recordedAt: 'DESC' },
      take: 50, // Limiter à 50 derniers enregistrements
    });

    return {
      vehicle: {
        id: vehicle.id,
        registration: vehicle.registration,
        brand: vehicle.brand,
        model: vehicle.model,
        currentKm: vehicle.currentKm,
      },
      history,
      total: history.length,
    };
  }

  /**
   * TRIPS - Démarrer un trip
   */
  @Post('trips/start')
  @ApiOperation({ summary: 'Start a trip' })
  @ApiResponse({ status: 201, description: 'Trip started successfully' })
  async startTrip(@Req() req: Request, @Body() dto: StartTripDto) {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    return await this.tripsService.startTrip(dto, driver.id, user.tenantId);
  }

  /**
   * TRIPS - Terminer un trip
   */
  @Post('trips/:tripId/end')
  @ApiOperation({ summary: 'End a trip' })
  @ApiResponse({ status: 200, description: 'Trip ended successfully' })
  async endTrip(
    @Req() req: Request,
    @Param('tripId') tripId: string,
    @Body() dto: EndTripDto,
  ) {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    return await this.tripsService.endTrip(tripId, dto, driver.id);
  }

  /**
   * TRIPS - Obtenir le trip en cours
   */
  @Get('trips/current')
  @ApiOperation({ summary: 'Get current trip' })
  @ApiResponse({ status: 200, description: 'Current trip retrieved' })
  async getCurrentTrip(@Req() req: Request) {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    return await this.tripsService.getCurrentTrip(driver.id);
  }

  /**
   * TRIPS - Obtenir l'historique des trips
   */
  @Get('trips/history')
  @ApiOperation({ summary: 'Get trip history' })
  @ApiResponse({ status: 200, description: 'Trip history retrieved' })
  async getTripHistory(@Req() req: Request, @Query() filterDto: TripFilterDto) {
    const user = (req as any).user;

    // Trouver le driver par email
    const driver = await this.driverRepository.findOne({
      where: { email: user.email, tenantId: user.tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    return await this.tripsService.getTripHistory(driver.id, filterDto);
  }
}
