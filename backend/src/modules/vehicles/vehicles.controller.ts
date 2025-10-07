import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { multerConfig } from './config/multer.config';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { TenantId } from '../../core/tenant/tenant.decorator';
import { SubscriptionLimitGuard, CheckLimit } from '../../common/guards/subscription-limit.guard';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
@UseGuards(JwtAuthGuard, TenantGuard)
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  @UseGuards(SubscriptionLimitGuard)
  @CheckLimit('vehicles')
  @ApiOperation({ summary: 'Créer un nouveau véhicule' })
  @ApiResponse({
    status: 201,
    description: 'Le véhicule a été créé avec succès.',
  })
  @ApiResponse({ status: 409, description: 'Véhicule déjà existant.' })
  @ApiResponse({ status: 403, description: 'Limite de véhicules atteinte pour votre plan.' })
  async create(
    @Body() createVehicleDto: CreateVehicleDto,
    @TenantId() tenantId: number,
  ) {
    const vehicle = await this.vehiclesService.create(createVehicleDto, tenantId);
    // Incrémenter l'usage après création réussie
    await this.subscriptionsService.updateUsage(tenantId, 'vehicles', 1);
    return vehicle;
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les véhicules' })
  @ApiResponse({
    status: 200,
    description: 'Liste des véhicules récupérée avec succès.',
  })
  findAll(@Query() query: QueryVehicleDto, @TenantId() tenantId: number) {
    return this.vehiclesService.findAll(query, tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques de la flotte de véhicules' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès.',
  })
  getStats(@TenantId() tenantId: number) {
    return this.vehiclesService.getStats(tenantId);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Récupérer la timeline d\'un véhicule (maintenances, documents, événements)' })
  @ApiResponse({ status: 200, description: 'Timeline récupérée avec succès.' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  getTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.getTimeline(id, tenantId);
  }

  @Get(':id/costs')
  @ApiOperation({ summary: 'Analyse des coûts d\'un véhicule' })
  @ApiResponse({ status: 200, description: 'Analyse des coûts récupérée avec succès.' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  getCostAnalysis(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.getCostAnalysis(id, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un véhicule par ID' })
  @ApiResponse({ status: 200, description: 'Véhicule trouvé.' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un véhicule' })
  @ApiResponse({
    status: 200,
    description: 'Le véhicule a été mis à jour avec succès.',
  })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  @ApiResponse({ status: 409, description: 'Conflit avec un véhicule existant.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, tenantId);
  }

  @Post(':id/photos')
  @UseInterceptors(FilesInterceptor('photos', 10, multerConfig))
  @ApiOperation({ summary: 'Upload de photos pour un véhicule (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Photos uploadées avec succès.' })
  @ApiResponse({ status: 400, description: 'Fichiers invalides ou limite dépassée.' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  async uploadPhotos(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.uploadPhotos(id, files, tenantId);
  }

  @Delete(':id/photos')
  @ApiOperation({ summary: 'Supprimer une photo d\'un véhicule' })
  @ApiResponse({ status: 200, description: 'Photo supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Véhicule ou photo non trouvé.' })
  async deletePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('photoUrl') photoUrl: string,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.deletePhoto(id, photoUrl, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  @ApiResponse({
    status: 200,
    description: 'Le véhicule a été supprimé avec succès.',
  })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
  ) {
    const result = await this.vehiclesService.remove(id, tenantId);
    // Décrémenter l'usage après suppression réussie
    await this.subscriptionsService.updateUsage(tenantId, 'vehicles', -1);
    return result;
  }
}
