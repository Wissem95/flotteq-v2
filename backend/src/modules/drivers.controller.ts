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

@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('status') status?: DriverStatus,
  ) {
    return this.driversService.findAll(page, limit, status);
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
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.remove(id);
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
