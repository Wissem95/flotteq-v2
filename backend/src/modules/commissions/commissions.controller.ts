import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Response,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { CommissionsService } from './commissions.service';
import { CommissionFilterDto } from './dto/commission-filter.dto';
import {
  CommissionResponseDto,
  CommissionListResponseDto,
  CommissionTotalDto,
} from './dto/commission-response.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { HybridAuthGuard } from '../../core/auth/guards/hybrid-auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';

interface RequestWithUser {
  user: {
    userId: string;
    tenantId?: number;
    role: string;
    partnerId?: string;
    type?: string; // 'partner' for partner JWT, undefined for tenant JWT
  };
}

@ApiTags('Commissions')
@Controller('commissions')
@UseGuards(HybridAuthGuard)
@ApiBearerAuth()
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all commissions with filters',
    description: 'Admin sees all commissions. Partner sees only their own.',
  })
  @ApiResponse({
    status: 200,
    description: 'Commissions retrieved successfully',
    type: CommissionListResponseDto,
  })
  async findAll(
    @Query() filters: CommissionFilterDto,
    @Request() req: RequestWithUser,
  ): Promise<CommissionListResponseDto> {
    // If user is partner, only show their commissions
    // Check type='partner' instead of role because partner JWT has type='partner' and role='owner'
    const partnerId =
      req.user.type === 'partner' ? req.user.partnerId : undefined;

    return this.commissionsService.findAll(filters, partnerId);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get commission statistics (Admin only)',
    description: 'Returns global commission statistics for admin dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: RequestWithUser,
  ): Promise<any> {
    if (req && req.user.role !== 'super_admin') {
      throw new ForbiddenException(
        'Only administrators can access commission statistics',
      );
    }

    const stats = await this.commissionsService.getStats(startDate, endDate);

    return {
      message: 'Statistics retrieved successfully',
      stats,
    };
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Get pending commissions (Admin only)',
    description: 'Returns all pending commissions across all partners',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending commissions retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getPendingCommissions(@Request() req: RequestWithUser): Promise<any> {
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException(
        'Only administrators can access all pending commissions',
      );
    }

    const commissions = await this.commissionsService.getPendingCommissions();

    return {
      message: 'Pending commissions retrieved successfully',
      count: commissions.length,
      commissions,
    };
  }

  @Get('totals/:partnerId')
  @ApiOperation({
    summary: 'Get commission totals by partner',
    description:
      'Returns total amounts grouped by status. Partners can only see their own totals.',
  })
  @ApiParam({ name: 'partnerId', format: 'uuid' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-10-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-10-31' })
  @ApiResponse({
    status: 200,
    description: 'Commission totals retrieved successfully',
    type: [CommissionTotalDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot access other partner totals',
  })
  async getTotalByPartner(
    @Param('partnerId') partnerId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: RequestWithUser,
  ): Promise<any> {
    // Check if partner is trying to access another partner's data
    if (
      req &&
      req.user.role === 'partner' &&
      req.user.partnerId !== partnerId
    ) {
      throw new ForbiddenException(
        'You can only access your own commission totals',
      );
    }

    const totals = await this.commissionsService.getTotalByPartner(
      partnerId,
      startDate,
      endDate,
    );

    return {
      message: 'Commission totals retrieved successfully',
      partnerId,
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time',
      },
      totals,
    };
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export commissions to Excel (Admin only)',
    description:
      'Exports filtered commissions to Excel file for accounting purposes',
  })
  @ApiResponse({
    status: 200,
    description: 'Excel file generated successfully',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async exportToExcel(
    @Query() filters: CommissionFilterDto,
    @Request() req: RequestWithUser,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException(
        'Only administrators can export commissions',
      );
    }

    const buffer = await this.commissionsService.exportToExcel(filters);

    const filename = `commissions_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get commission by ID',
    description: 'Partners can only access their own commissions',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Commission found',
    type: CommissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Commission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your commission' })
  async findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    // Check type='partner' instead of role because partner JWT has type='partner' and role='owner'
    const partnerId =
      req.user.type === 'partner' ? req.user.partnerId : undefined;

    const commission = await this.commissionsService.findOne(id, partnerId);

    return {
      message: 'Commission retrieved successfully',
      commission,
    };
  }

  @Patch(':id/paid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark commission as paid (Admin only)',
    description: 'Updates commission status to PAID with payment reference',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Commission marked as paid successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Commission cannot be marked as paid',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Commission not found' })
  async markAsPaid(
    @Param('id') id: string,
    @Body() markPaidDto: MarkPaidDto,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException(
        'Only administrators can mark commissions as paid',
      );
    }

    const commission = await this.commissionsService.markAsPaid(
      id,
      markPaidDto,
      req.user.userId,
    );

    return {
      message: 'Commission marked as paid successfully',
      commission,
    };
  }
}
