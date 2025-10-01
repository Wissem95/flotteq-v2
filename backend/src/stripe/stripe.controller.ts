import {
  Controller,
  Post,
  Headers,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly stripeService: StripeService) {}

  /**
   * Endpoint pour recevoir les webhooks Stripe
   * IMPORTANT: Doit être en raw body, pas en JSON parsé
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      this.logger.error('Missing stripe-signature header');
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = request.rawBody || Buffer.from(JSON.stringify(request.body));

    try {
      await this.stripeService.handleWebhook(signature, rawBody);
      return { received: true };
    } catch (error) {
      this.logger.error('Webhook processing failed', error);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  /**
   * Créer une session de portal client
   */
  @Post('create-portal-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe customer portal session' })
  @ApiResponse({ status: 200, description: 'Portal session created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Stripe customer not found' })
  async createPortalSession(@Req() request: any): Promise<{ url: string }> {
    const user = request.user;
    const tenant = user.tenant;

    if (!tenant || !tenant.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer found for this tenant');
    }

    const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/billing`;
    const url = await this.stripeService.createPortalSession(tenant.stripeCustomerId, returnUrl);

    return { url };
  }
}
