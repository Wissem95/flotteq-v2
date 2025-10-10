import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseUUIDPipe
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { AssignVehicleDto } from './dto/assign-vehicle.dto';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';
import { DriverStatus } from '../entities/driver.entity';
import { SubscriptionLimitGuard, CheckLimit } from '../common/guards/subscription-limit.guard';
import { SubscriptionsService } from './subscriptions/subscriptions.service';
import { TenantId } from '../core/tenant/tenant.decorator';

@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  @UseGuards(SubscriptionLimitGuard)
  @CheckLimit('drivers')
  async create(@Body() createDriverDto: CreateDriverDto, @TenantId() tenantId: number) {
    const driver = await this.driversService.create(createDriverDto);
    // Incrémenter l'usage après création réussie
    await this.subscriptionsService.updateUsage(tenantId, 'drivers', 1);
    return driver;
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: DriverStatus,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.driversService.findAll(parsedPage, parsedLimit, status);
  }

  @Get('available')
  getAvailableDrivers() {
    return this.driversService.getAvailableDrivers();
  }

  @Get('expiring-licenses')
  getExpiringLicenses(@Query('days', ParseIntPipe) days = 30) {
    return this.driversService.getExpiringLicenses(days);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.findOne(id);
  }

  @Get(':id/vehicles')
  getDriverVehicles(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.getDriverVehicles(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: number) {
    const result = await this.driversService.remove(id);
    // Décrémenter l'usage après suppression réussie
    await this.subscriptionsService.updateUsage(tenantId, 'drivers', -1);
    return result;
  }

  @Post(':id/assign-vehicle')
  assignVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignVehicleDto: AssignVehicleDto,
  ) {
    return this.driversService.assignVehicle(id, assignVehicleDto.vehicleId);
  }

  @Post(':id/unassign-vehicle')
  unassignVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignVehicleDto: AssignVehicleDto,
  ) {
    return this.driversService.unassignVehicle(id, assignVehicleDto.vehicleId);
  }
}
