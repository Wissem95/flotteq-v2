import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { TenantId } from '../../core/tenant/tenant.decorator';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // ========== ENDPOINTS PLANS (Public pour voir les plans) ==========
  @Get('plans')
  @ApiOperation({ summary: 'Get all available subscription plans' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get a specific plan by ID' })
  getPlan(@Param('id') id: string) {
    return this.subscriptionsService.getPlan(+id);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create a new subscription plan (Admin only)' })
  createPlan(@Body() dto: CreatePlanDto) {
    return this.subscriptionsService.createPlan(dto);
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Update a subscription plan (Admin only)' })
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.subscriptionsService.updatePlan(+id, dto);
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Delete a subscription plan (Admin only)' })
  deletePlan(@Param('id') id: string) {
    return this.subscriptionsService.deletePlan(+id);
  }

  // ========== ENDPOINTS ABONNEMENTS ==========
  @Get()
  @ApiOperation({ summary: 'Get all subscriptions (Admin only)' })
  getAllSubscriptions() {
    return this.subscriptionsService.getAllSubscriptions();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant subscription' })
  getCurrentSubscription(@TenantId() tenantId: string) {
    return this.subscriptionsService.getCurrentSubscription(+tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get subscription usage stats' })
  getStats(@TenantId() tenantId: string) {
    return this.subscriptionsService.getSubscriptionStats(+tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a subscription for current tenant' })
  createSubscription(
    @TenantId() tenantId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.createSubscription(+tenantId, dto.planId);
  }

  @Patch('change-plan/:planId')
  @ApiOperation({ summary: 'Change subscription plan' })
  changePlan(
    @TenantId() tenantId: string,
    @Param('planId') planId: string,
  ) {
    return this.subscriptionsService.changePlan(+tenantId, +planId);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel current subscription' })
  cancelSubscription(@TenantId() tenantId: string) {
    return this.subscriptionsService.cancelSubscription(+tenantId);
  }

  @Post('check-limit/:resource')
  @ApiOperation({ summary: 'Check if can add more resources' })
  async checkLimit(
    @TenantId() tenantId: string,
    @Param('resource') resource: 'vehicles' | 'users' | 'drivers',
  ) {
    const canAdd = await this.subscriptionsService.checkLimit(+tenantId, resource);
    return { canAdd, resource };
  }
}
