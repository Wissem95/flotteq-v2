import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ReportsService } from './reports.service';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import {
  ReportResponseDto,
  ReportListResponseDto,
} from './dto/report-response.dto';
import { Report } from '../../entities/report.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reports (tenant admins)' })
  @ApiResponse({ status: 200, type: ReportListResponseDto })
  @Roles(UserRole.TENANT_ADMIN)
  async findAll(
    @Req() req: Request,
    @Query() filters: ReportFilterDto,
  ): Promise<ReportListResponseDto> {
    const user = (req as any).user;
    return this.reportsService.findAll(user.tenantId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, type: ReportResponseDto })
  async findOne(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ReportResponseDto> {
    const user = (req as any).user;
    const report = await this.reportsService.findOne(id, user.tenantId);

    // Map to DTO manually since we don't have the private method access
    return {
      id: report.id,
      vehicleId: report.vehicleId,
      vehicleRegistration: report.vehicle?.registration,
      driverId: report.driverId,
      driverName: report.driver
        ? `${report.driver.firstName} ${report.driver.lastName}`
        : undefined,
      type: report.type,
      description: report.description,
      notes: report.notes,
      status: report.status,
      photos: report.photos,
      acknowledgedAt: report.acknowledgedAt,
      acknowledgedBy: report.acknowledgedBy,
      acknowledgedByName: report.acknowledgedByUser
        ? `${report.acknowledgedByUser.firstName} ${report.acknowledgedByUser.lastName}`
        : null,
      resolvedAt: report.resolvedAt,
      resolvedBy: report.resolvedBy,
      resolvedByName: report.resolvedByUser
        ? `${report.resolvedByUser.firstName} ${report.resolvedByUser.lastName}`
        : null,
      resolutionNotes: report.resolutionNotes,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }

  @Patch(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge report (tenant admins)' })
  @ApiResponse({ status: 200, type: ReportResponseDto })
  @Roles(UserRole.TENANT_ADMIN)
  @HttpCode(HttpStatus.OK)
  async acknowledge(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<Report> {
    const user = (req as any).user;
    return this.reportsService.acknowledge(id, user.sub, user.tenantId);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve report (tenant admins)' })
  @ApiResponse({ status: 200, type: ReportResponseDto })
  @Roles(UserRole.TENANT_ADMIN)
  @HttpCode(HttpStatus.OK)
  async resolve(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { resolutionNotes?: string },
  ): Promise<Report> {
    const user = (req as any).user;
    return this.reportsService.resolve(
      id,
      user.sub,
      user.tenantId,
      body.resolutionNotes,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report (tenant admins)' })
  @ApiResponse({ status: 200, type: ReportResponseDto })
  @Roles(UserRole.TENANT_ADMIN)
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<Report> {
    const user = (req as any).user;
    return this.reportsService.update(
      id,
      updateReportDto,
      user.sub,
      user.tenantId,
    );
  }
}
