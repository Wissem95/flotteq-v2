import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService, EmailOptions } from './email.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private emailService: EmailService) {}

  @Process('send')
  async handleSendEmail(job: Job<EmailOptions>) {
    this.logger.debug(`Processing email job ${job.id}`);

    try {
      await this.emailService.sendEmail(job.data);
      this.logger.log(`Email sent successfully: ${job.data.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error; // Bull will retry
    }
  }

  @Process('welcome')
  async handleWelcomeEmail(job: Job<{ email: string; firstName: string; tenantName: string }>) {
    this.logger.debug(`Processing welcome email job ${job.id}`);

    try {
      await this.emailService.sendWelcomeEmail(
        job.data.email,
        job.data.firstName,
        job.data.tenantName,
      );
      this.logger.log(`Welcome email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('maintenance-reminder')
  async handleMaintenanceReminder(job: Job<any>) {
    this.logger.debug(`Processing maintenance reminder job ${job.id}`);

    try {
      await this.emailService.sendMaintenanceReminder(
        job.data.email,
        job.data.firstName,
        job.data.maintenanceData,
        job.data.daysUntil,
      );
      this.logger.log(`Maintenance reminder sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send maintenance reminder: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('document-expiring')
  async handleDocumentExpiring(job: Job<any>) {
    this.logger.debug(`Processing document expiring job ${job.id}`);

    try {
      await this.emailService.sendDocumentExpiringAlert(
        job.data.email,
        job.data.firstName,
        job.data.documentData,
        job.data.daysUntil,
      );
      this.logger.log(`Document expiring alert sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send document expiring alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('password-reset')
  async handlePasswordResetEmail(job: Job<{ email: string; firstName: string; resetUrl: string }>) {
    this.logger.debug(`Processing password reset email job ${job.id}`);

    try {
      await this.emailService.sendPasswordResetEmail(
        job.data.email,
        job.data.firstName,
        job.data.resetUrl,
      );
      this.logger.log(`Password reset email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('partner-welcome')
  async handlePartnerWelcomeEmail(job: Job<{ email: string; firstName: string; companyName: string }>) {
    this.logger.debug(`Processing partner welcome email job ${job.id}`);

    try {
      await this.emailService.sendPartnerWelcomeEmail(
        job.data.email,
        job.data.firstName,
        job.data.companyName,
      );
      this.logger.log(`Partner welcome email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send partner welcome email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('partner-approved')
  async handlePartnerApprovedEmail(job: Job<{ email: string; firstName: string; companyName: string }>) {
    this.logger.debug(`Processing partner approved email job ${job.id}`);

    try {
      await this.emailService.sendPartnerApprovedEmail(
        job.data.email,
        job.data.firstName,
        job.data.companyName,
      );
      this.logger.log(`Partner approved email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send partner approved email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('partner-rejected')
  async handlePartnerRejectedEmail(
    job: Job<{ email: string; firstName: string; companyName: string; reason: string }>,
  ) {
    this.logger.debug(`Processing partner rejected email job ${job.id}`);

    try {
      await this.emailService.sendPartnerRejectedEmail(
        job.data.email,
        job.data.firstName,
        job.data.companyName,
        job.data.reason,
      );
      this.logger.log(`Partner rejected email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send partner rejected email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('partner-booking-new')
  async handlePartnerBookingNew(job: Job<{ email: string; companyName: string; bookingData: any }>) {
    this.logger.debug(`Processing partner booking new email job ${job.id}`);

    try {
      await this.emailService.sendPartnerBookingNew(
        job.data.email,
        job.data.companyName,
        job.data.bookingData,
      );
      this.logger.log(`Partner booking new email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send partner booking new email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('partner-booking-cancelled')
  async handlePartnerBookingCancelled(job: Job<{ email: string; companyName: string; bookingData: any }>) {
    this.logger.debug(`Processing partner booking cancelled email job ${job.id}`);

    try {
      await this.emailService.sendPartnerBookingCancelled(
        job.data.email,
        job.data.companyName,
        job.data.bookingData,
      );
      this.logger.log(`Partner booking cancelled email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send partner booking cancelled email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('booking-confirmed')
  async handleBookingConfirmed(job: Job<{ email: string; tenantName: string; bookingData: any }>) {
    this.logger.debug(`Processing booking confirmed email job ${job.id}`);

    try {
      await this.emailService.sendBookingConfirmed(
        job.data.email,
        job.data.tenantName,
        job.data.bookingData,
      );
      this.logger.log(`Booking confirmed email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send booking confirmed email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('booking-rejected')
  async handleBookingRejected(job: Job<{ email: string; tenantName: string; bookingData: any }>) {
    this.logger.debug(`Processing booking rejected email job ${job.id}`);

    try {
      await this.emailService.sendBookingRejected(
        job.data.email,
        job.data.tenantName,
        job.data.bookingData,
      );
      this.logger.log(`Booking rejected email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send booking rejected email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('booking-completed')
  async handleBookingCompleted(job: Job<{ email: string; tenantName: string; bookingData: any }>) {
    this.logger.debug(`Processing booking completed email job ${job.id}`);

    try {
      await this.emailService.sendBookingCompleted(
        job.data.email,
        job.data.tenantName,
        job.data.bookingData,
      );
      this.logger.log(`Booking completed email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send booking completed email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('booking-reminder')
  async handleBookingReminder(job: Job<{ email: string; tenantName: string; bookingData: any }>) {
    this.logger.debug(`Processing booking reminder email job ${job.id}`);

    try {
      await this.emailService.sendBookingReminder(
        job.data.email,
        job.data.tenantName,
        job.data.bookingData,
      );
      this.logger.log(`Booking reminder email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send booking reminder email: ${error.message}`, error.stack);
      throw error;
    }
  }
}
