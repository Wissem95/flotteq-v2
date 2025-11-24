import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import {
  TenantId,
  CurrentTenant,
  TenantContext,
} from '../core/tenant/tenant.decorator';

@ApiTags('Test')
@Controller('test')
export class TestController {
  @Get('tenant-info')
  @ApiOperation({
    summary: 'Get tenant information',
    description:
      'Returns the current tenant ID and confirms multi-tenant system is working',
  })
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant identifier',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant information retrieved successfully',
    schema: {
      example: {
        tenantId: '1',
        message: 'Multi-tenant works!',
        timestamp: '2025-09-29T16:15:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'X-Tenant-ID header is required',
  })
  getTenantInfo(@TenantId() tenantId?: string) {
    return {
      tenantId,
      message: 'Multi-tenant works!',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('tenant-context')
  @ApiOperation({
    summary: 'Get full tenant context',
    description: 'Returns both tenant ID and tenant object (if available)',
  })
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant identifier',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Full tenant context retrieved successfully',
  })
  getTenantContext(
    @TenantContext() context: { tenantId?: string; tenant?: any },
  ) {
    return {
      ...context,
      message: 'Full tenant context retrieved',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('current-tenant')
  @ApiOperation({
    summary: 'Get current tenant object',
    description: 'Returns the full tenant object if available',
  })
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant identifier',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Current tenant object retrieved',
  })
  getCurrentTenant(
    @CurrentTenant() tenant: any,
    @TenantId() tenantId?: string,
  ) {
    return {
      tenantId,
      tenant,
      message: tenant
        ? 'Tenant object found'
        : 'Tenant object not loaded (normal for basic setup)',
      timestamp: new Date().toISOString(),
    };
  }
}
