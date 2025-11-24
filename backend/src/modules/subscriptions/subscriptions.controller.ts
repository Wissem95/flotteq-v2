import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { InvoiceDto } from './dto/invoice.dto';
import { PaymentMethodDto } from './dto/payment-method.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { TenantId } from '../../core/tenant/tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { StripeService } from '../../stripe/stripe.service';
import { Tenant } from '../../entities/tenant.entity';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  // ========== ENDPOINTS PLANS (Public pour voir les plans) ==========
  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'Get all available subscription plans' })
  getPlans() {
    // Retourner uniquement les plans actifs pour le public
    return this.subscriptionsService.getPlans(true);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get a specific plan by ID' })
  getPlan(@Param('id') id: string) {
    return this.subscriptionsService.getPlan(+id);
  }

  @Post('plans')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Create a new subscription plan (Admin only)' })
  createPlan(@Body() dto: CreatePlanDto) {
    return this.subscriptionsService.createPlan(dto);
  }

  @Patch('plans/:id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Update a subscription plan (Admin only)' })
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.subscriptionsService.updatePlan(+id, dto);
  }

  @Delete('plans/:id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Delete a subscription plan (Admin only)' })
  deletePlan(@Param('id') id: string) {
    return this.subscriptionsService.deletePlan(+id);
  }

  // ========== ENDPOINTS ABONNEMENTS ==========
  @Get()
  @UseGuards(SuperAdminGuard)
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
  changePlan(@TenantId() tenantId: string, @Param('planId') planId: string) {
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
    const canAdd = await this.subscriptionsService.checkLimit(
      +tenantId,
      resource,
    );
    return { canAdd, resource };
  }

  // ========== ENDPOINTS BILLING ==========

  @Post('create-checkout-session')
  @ApiOperation({ summary: 'Create Stripe checkout session for plan upgrade' })
  async createCheckoutSession(
    @Req() req: any,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<{ url: string }> {
    const tenantId = req.user.tenantId;

    // Charger le tenant depuis la DB
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Créer le customer Stripe s'il n'existe pas
    if (!tenant.stripeCustomerId) {
      const customerId = await this.stripeService.createCustomer(
        tenant,
        tenant.email,
      );
      tenant.stripeCustomerId = customerId;
      await this.tenantRepository.save(tenant);
    }

    // Récupérer le plan pour obtenir stripePriceId
    const plan = await this.subscriptionsService.getPlan(dto.planId);

    if (!plan.stripePriceId) {
      throw new NotFoundException(
        'This plan does not have a Stripe price configured',
      );
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = dto.successUrl || `${frontendUrl}/billing/success`;
    const cancelUrl = dto.cancelUrl || `${frontendUrl}/billing`;

    const url = await this.stripeService.createCheckoutSession(
      tenant.stripeCustomerId,
      plan.stripePriceId,
      successUrl,
      cancelUrl,
    );

    return { url };
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get invoice history for current tenant' })
  async getInvoices(@Req() req: any): Promise<InvoiceDto[]> {
    const tenantId = req.user.tenantId;

    // Charger le tenant depuis la DB
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.stripeCustomerId) {
      return [];
    }

    return this.stripeService.getInvoices(tenant.stripeCustomerId);
  }

  @Get('invoices/:id/download')
  @ApiOperation({ summary: 'Download invoice PDF' })
  async downloadInvoice(
    @Req() req: any,
    @Param('id') invoiceId: string,
    @Res() res: Response,
  ): Promise<void> {
    const tenantId = req.user.tenantId;

    // Charger le tenant depuis la DB
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.stripeCustomerId) {
      throw new NotFoundException('No Stripe customer found');
    }

    const invoice = await this.stripeService.getInvoice(invoiceId);

    if (!invoice.pdfUrl) {
      throw new NotFoundException('Invoice PDF not available');
    }

    // Redirect to Stripe PDF URL
    res.redirect(invoice.pdfUrl);
  }

  @Get('payment-method')
  @ApiOperation({ summary: 'Get current payment method' })
  async getPaymentMethod(@Req() req: any): Promise<PaymentMethodDto | null> {
    const tenantId = req.user.tenantId;

    // Charger le tenant depuis la DB
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.stripeCustomerId) {
      return null;
    }

    return this.stripeService.getPaymentMethod(tenant.stripeCustomerId);
  }
}
