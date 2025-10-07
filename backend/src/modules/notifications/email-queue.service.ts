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
}
