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
}
