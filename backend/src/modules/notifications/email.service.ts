import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private layoutTemplate: HandlebarsTemplateDelegate;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });

    this.loadTemplates();
  }

  private loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');
    const templateFiles = [
      'welcome',
      'maintenance-reminder',
      'document-expiring',
      'password-reset',
      'driver-welcome',
      'partner-welcome',
      'partner-approved',
      'partner-rejected',
      'partner-booking-new',
      'partner-booking-cancelled',
    ];

    try {
      // Load layout
      const layoutPath = path.join(templatesDir, 'layout.hbs');
      const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
      this.layoutTemplate = Handlebars.compile(layoutContent);

      // Load and compile templates
      for (const templateName of templateFiles) {
        const templatePath = path.join(templatesDir, `${templateName}.hbs`);
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const bodyTemplate = Handlebars.compile(templateContent);
        this.templates.set(templateName, bodyTemplate);
      }

      this.logger.log(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      this.logger.error('Failed to load email templates', error.stack);
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const template = this.templates.get(options.template);
      if (!template) {
        throw new Error(`Template "${options.template}" not found`);
      }

      // Generate HTML from template
      const bodyHtml = template(options.context);

      // Wrap with layout
      const html = this.layoutTemplate({ body: bodyHtml });

      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html,
      });

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Helper methods
  async sendWelcomeEmail(email: string, firstName: string, tenantName: string) {
    await this.sendEmail({
      to: email,
      subject: 'Bienvenue sur FlotteQ !',
      template: 'welcome',
      context: {
        firstName,
        tenantName,
        email,
        appUrl: this.configService.get('APP_URL', 'http://localhost:5173'),
      },
    });
  }

  async sendMaintenanceReminder(
    email: string,
    firstName: string,
    maintenanceData: any,
    daysUntil: number,
  ) {
    await this.sendEmail({
      to: email,
      subject: `Rappel : Maintenance ${daysUntil === 1 ? 'demain' : `dans ${daysUntil} jours`}`,
      template: 'maintenance-reminder',
      context: {
        firstName,
        daysUntil: daysUntil === 1 ? 'demain' : `dans ${daysUntil} jours`,
        ...maintenanceData,
        appUrl: this.configService.get('APP_URL', 'http://localhost:5173'),
      },
    });
  }

  async sendDocumentExpiringAlert(
    email: string,
    firstName: string,
    documentData: any,
    daysUntil: number,
  ) {
    await this.sendEmail({
      to: email,
      subject: `Document expirant dans ${daysUntil} jours`,
      template: 'document-expiring',
      context: {
        firstName,
        daysUntil,
        ...documentData,
        appUrl: this.configService.get('APP_URL', 'http://localhost:5173'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetUrl: string) {
    await this.sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe FlotteQ',
      template: 'password-reset',
      context: {
        firstName,
        resetUrl,
        appUrl: this.configService.get('APP_URL', 'http://localhost:5173'),
      },
    });
  }

  async sendDriverWelcomeEmail(
    email: string,
    firstName: string,
    tenantName: string,
    tempPassword: string,
  ) {
    await this.sendEmail({
      to: email,
      subject: 'Bienvenue en tant que conducteur sur FlotteQ',
      template: 'driver-welcome',
      context: {
        firstName,
        tenantName,
        email,
        tempPassword,
        appUrl: this.configService.get('APP_URL', 'http://localhost:5173'),
      },
    });
  }
}
