import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async queueWelcomeEmail(email: string, firstName: string, tenantName: string) {
    try {
      await this.emailQueue.add(
        'welcome',
        {
          email,
          firstName,
          tenantName,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`Welcome email queued for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue welcome email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async queueMaintenanceReminder(
    email: string,
    firstName: string,
    maintenanceData: any,
    daysUntil: number,
  ) {
    try {
      await this.emailQueue.add(
        'maintenance-reminder',
        {
          email,
          firstName,
          maintenanceData,
          daysUntil,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          delay: 0, // Send immediately
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`Maintenance reminder queued for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue maintenance reminder: ${error.message}`, error.stack);
      throw error;
    }
  }

  async queueDocumentExpiringAlert(
    email: string,
    firstName: string,
    documentData: any,
    daysUntil: number,
  ) {
    try {
      await this.emailQueue.add(
        'document-expiring',
        {
          email,
          firstName,
          documentData,
          daysUntil,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`Document expiring alert queued for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue document expiring alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  async queuePasswordResetEmail(email: string, firstName: string, resetUrl: string) {
    try {
      await this.emailQueue.add(
        'password-reset',
        {
          email,
          firstName,
          resetUrl,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`Password reset email queued for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue password reset email: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Partner-related emails
  async queuePartnerWelcomeEmail(email: string, firstName: string, companyName: string) {
    try {
      await this.emailQueue.add(
        'partner-welcome',
        {
          email,
          firstName,
          companyName,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`Partner welcome email queued for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue partner welcome email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async queuePartnerApprovedEmail(email: string, firstName: string, companyName: string) {
    try {
      await this.emailQueue.add(
        'partner-approved',
        {
          email,
          firstName,
          companyName,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`Partner approved email queued for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue partner approved email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async queuePartnerRejectedEmail(
    email: string,
    firstName: string,
    companyName: string,
    reason: string,
  ) {
    try {
      await this.emailQueue.add(
        'partner-rejected',
        {
          email,
          firstName,
          companyName,
          reason,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`Partner rejected email queued for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue partner rejected email: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Booking-related emails
  async queuePartnerBookingNew(
    email: string,
    companyName: string,
    bookingData: any,
  ) {
    try {
      await this.emailQueue.add(
        'partner-booking-new',
        {
          email,
          companyName,
          bookingData,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`New booking email queued for partner ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue partner booking new email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async queuePartnerBookingCancelled(
    email: string,
    companyName: string,
    bookingData: any,
  ) {
    try {
      await this.emailQueue.add(
        'partner-booking-cancelled',
        {
          email,
          companyName,
          bookingData,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`Booking cancelled email queued for partner ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue partner booking cancelled email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async queueBookingConfirmed(
    email: string,
    tenantName: string,
    bookingData: any,
  ) {
    try {
      await this.emailQueue.add(
        'booking-confirmed',
        {
          email,
          tenantName,
          bookingData,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`Booking confirmed email queued for tenant ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue booking confirmed email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async queueBookingRejected(
    email: string,
    tenantName: string,
    bookingData: any,
  ) {
    try {
      await this.emailQueue.add(
        'booking-rejected',
        {
          email,
          tenantName,
          bookingData,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`Booking rejected email queued for tenant ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue booking rejected email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async queueBookingCompleted(
    email: string,
    tenantName: string,
    bookingData: any,
  ) {
    try {
      await this.emailQueue.add(
        'booking-completed',
        {
          email,
          tenantName,
          bookingData,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(`Booking completed email queued for tenant ${email}`);
    } catch (error) {
      this.logger.error(`Failed to queue booking completed email: ${error.message}`, error.stack);
      throw error;
    }
  }
}
