import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../entities/booking.entity';
import { Commission, CommissionStatus } from '../../entities/commission.entity';
import { Partner } from '../../entities/partner.entity';
import { StripeService } from '../../stripe/stripe.service';

@Injectable()
export class BookingsPaymentService {
  private readonly logger = new Logger(BookingsPaymentService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,

    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,

    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,

    private stripeService: StripeService,
  ) {}

  /**
   * Créer PaymentIntent avec split commission Stripe Connect
   */
  async createPaymentIntent(bookingId: string, tenantId: number) {
    // Charger booking avec relations
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['partner', 'service', 'tenant', 'vehicle'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Vérifications sécurité
    if (booking.tenantId !== tenantId) {
      throw new ForbiddenException('Not your booking');
    }

    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      throw new BadRequestException('Booking must be confirmed or completed');
    }

    if (booking.paymentStatus === 'paid') {
      throw new BadRequestException('Booking already paid');
    }

    if (!booking.partner) {
      throw new NotFoundException('Partner not found');
    }

    if (!booking.partner.stripeAccountId) {
      throw new BadRequestException('Partner Stripe account not configured');
    }

    if (!booking.partner.stripeOnboardingCompleted) {
      throw new BadRequestException('Partner must complete Stripe onboarding first');
    }

    // Calculer montants
    const totalAmountCents = Math.round(Number(booking.price) * 100); // en centimes
    const commissionRate = Number(booking.partner.commissionRate || 10);
    const commissionAmountCents = Math.round(totalAmountCents * (commissionRate / 100));
    const partnerAmountCents = totalAmountCents - commissionAmountCents;

    this.logger.log(
      `Creating payment: Total ${totalAmountCents}¢, Commission ${commissionAmountCents}¢ (${commissionRate}%), Partner ${partnerAmountCents}¢`
    );

    // Créer PaymentIntent avec Destination Charge
    const paymentIntent = await this.stripeService.stripe.paymentIntents.create({
      amount: totalAmountCents,
      currency: 'eur',

      // Split automatique : Commission FlotteQ + Transfer Partner
      application_fee_amount: commissionAmountCents,
      transfer_data: {
        destination: booking.partner.stripeAccountId,
      },

      // Metadata pour webhook
      metadata: {
        bookingId: booking.id,
        partnerId: booking.partnerId,
        tenantId: tenantId.toString(),
        commissionAmount: (commissionAmountCents / 100).toString(),
        commissionRate: commissionRate.toString(),
        type: 'booking_payment',
      },

      // Description
      description: `${booking.service?.name || 'Service'} - ${booking.vehicle?.registration || 'Véhicule'}`,

      // Capture automatique
      capture_method: 'automatic',
    });

    // Créer commission en DB (status: pending)
    const existingCommission = await this.commissionRepository.findOne({
      where: { bookingId: booking.id }
    });

    if (!existingCommission) {
      const commission = this.commissionRepository.create({
        bookingId: booking.id,
        partnerId: booking.partnerId,
        amount: commissionAmountCents / 100, // retour en euros
        status: CommissionStatus.PENDING,
      });

      await this.commissionRepository.save(commission);
      this.logger.log(`Commission created for booking ${booking.id}: ${commission.amount}€`);
    }

    return {
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      amount: totalAmountCents / 100,
      commissionAmount: commissionAmountCents / 100,
      partnerAmount: partnerAmountCents / 100,
    };
  }

  /**
   * Webhook handler - Marquer booking + commission payés
   */
  async handlePaymentSuccess(paymentIntentId: string) {
    this.logger.log(`Handling payment success for PaymentIntent ${paymentIntentId}`);

    const paymentIntent = await this.stripeService.stripe.paymentIntents.retrieve(paymentIntentId);

    const bookingId = paymentIntent.metadata?.bookingId;

    if (!bookingId) {
      throw new BadRequestException('Booking ID not found in payment metadata');
    }

    // Marquer booking payé
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['partner'],
    });

    if (booking) {
      booking.paymentStatus = 'paid';
      booking.paidAt = new Date();
      await this.bookingRepository.save(booking);

      this.logger.log(`Booking ${bookingId} marked as paid`);
    }

    // Marquer commission payée
    const commission = await this.commissionRepository.findOne({
      where: { bookingId }
    });

    if (commission) {
      commission.status = CommissionStatus.PAID;
      commission.paidAt = new Date();
      commission.paymentReference = paymentIntentId;
      await this.commissionRepository.save(commission);

      this.logger.log(`Commission ${commission.id} marked as paid. Amount: ${commission.amount}€`);
    }

    return { success: true };
  }
}
