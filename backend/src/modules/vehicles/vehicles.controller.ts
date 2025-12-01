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
  Req,
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
import {
  SubscriptionLimitGuard,
  CheckLimit,
} from '../../common/guards/subscription-limit.guard';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { Auditable } from '../../common/decorators/auditable.decorator';

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SUPPORT,
    UserRole.TENANT_ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(SubscriptionLimitGuard)
  @CheckLimit('vehicles')
  @Auditable('Vehicle')
  @ApiOperation({ summary: 'Créer un nouveau véhicule' })
  @ApiResponse({
    status: 201,
    description: 'Le véhicule a été créé avec succès.',
  })
  @ApiResponse({ status: 409, description: 'Véhicule déjà existant.' })
  @ApiResponse({
    status: 403,
    description:
      'Limite de véhicules atteinte pour votre plan ou rôle insuffisant.',
  })
  async create(
    @Body() createVehicleDto: CreateVehicleDto,
    @TenantId() tenantId: number,
  ) {
    const vehicle = await this.vehiclesService.create(
      createVehicleDto,
      tenantId,
    );
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
  findAll(
    @Query() query: QueryVehicleDto,
    @Req() req: any,
  ) {
    // Si super_admin (défini par TenantGuard), voir tous les véhicules
    const isSuperAdmin = req.isSuperAdmin === true;
    const tenantId = isSuperAdmin ? null : req.user?.tenantId;
    console.log('🚗 VehiclesController.findAll - isSuperAdmin:', isSuperAdmin, 'tenantId passé au service:', tenantId);
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
  @ApiOperation({
    summary:
      "Récupérer la timeline d'un véhicule (maintenances, documents, événements)",
  })
  @ApiResponse({ status: 200, description: 'Timeline récupérée avec succès.' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  getTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.getTimeline(id, tenantId);
  }

  @Get(':id/costs')
  @ApiOperation({ summary: "Analyse des coûts d'un véhicule" })
  @ApiResponse({
    status: 200,
    description: 'Analyse des coûts récupérée avec succès.',
  })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  getCostAnalysis(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.getCostAnalysis(id, tenantId);
  }

  @Get(':id/tco')
  @ApiOperation({ summary: 'Calcul du TCO (Total Cost of Ownership)' })
  @ApiResponse({ status: 200, description: 'TCO calculé avec succès.' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  getTCO(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: number) {
    return this.vehiclesService.calculateTCO(id, tenantId);
  }

  @Get(':id/mileage-history')
  @ApiOperation({
    summary: "Récupérer l'historique du kilométrage d'un véhicule",
  })
  @ApiResponse({
    status: 200,
    description: 'Historique du kilométrage récupéré avec succès.',
  })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  getMileageHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.getMileageHistory(id, tenantId);
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
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SUPPORT,
    UserRole.TENANT_ADMIN,
    UserRole.MANAGER,
  )
  @Auditable('Vehicle')
  @ApiOperation({ summary: 'Mettre à jour un véhicule' })
  @ApiResponse({
    status: 200,
    description: 'Le véhicule a été mis à jour avec succès.',
  })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  @ApiResponse({
    status: 409,
    description: 'Conflit avec un véhicule existant.',
  })
  @ApiResponse({ status: 403, description: 'Rôle insuffisant.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, tenantId);
  }

  @Delete(':id/driver')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SUPPORT,
    UserRole.TENANT_ADMIN,
    UserRole.MANAGER,
  )
  @ApiOperation({ summary: "Désassigner le conducteur d'un véhicule" })
  @ApiResponse({
    status: 200,
    description: 'Conducteur désassigné avec succès.',
  })
  @ApiResponse({ status: 400, description: 'Aucun conducteur assigné.' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  @ApiResponse({ status: 403, description: 'Rôle insuffisant.' })
  unassignDriver(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.unassignDriver(id, tenantId);
  }

  @Post(':id/photos')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SUPPORT,
    UserRole.TENANT_ADMIN,
    UserRole.MANAGER,
  )
  @UseInterceptors(FilesInterceptor('photos', 10, multerConfig))
  @ApiOperation({ summary: 'Upload de photos pour un véhicule (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Photos uploadées avec succès.' })
  @ApiResponse({
    status: 400,
    description: 'Fichiers invalides ou limite dépassée.',
  })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  @ApiResponse({ status: 403, description: 'Rôle insuffisant.' })
  async uploadPhotos(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.uploadPhotos(id, files, tenantId);
  }

  @Delete(':id/photos')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SUPPORT,
    UserRole.TENANT_ADMIN,
    UserRole.MANAGER,
  )
  @ApiOperation({ summary: "Supprimer une photo d'un véhicule" })
  @ApiResponse({ status: 200, description: 'Photo supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Véhicule ou photo non trouvé.' })
  @ApiResponse({ status: 403, description: 'Rôle insuffisant.' })
  async deletePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('photoUrl') photoUrl: string,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.deletePhoto(id, photoUrl, tenantId);
  }

  @Delete(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SUPPORT,
    UserRole.TENANT_ADMIN,
    UserRole.MANAGER,
  )
  @Auditable('Vehicle')
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  @ApiResponse({
    status: 200,
    description: 'Le véhicule a été supprimé avec succès.',
  })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé.' })
  @ApiResponse({ status: 403, description: 'Rôle insuffisant.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
    @Req() req: any,
  ) {
    // Super admins et support peuvent supprimer n'importe quel véhicule
    const isSuperAdmin =
      req.user?.role === UserRole.SUPER_ADMIN ||
      req.user?.role === UserRole.SUPPORT;
    await this.vehiclesService.remove(id, tenantId, isSuperAdmin);
    return { message: 'Vehicle deleted successfully' };
  }
}
