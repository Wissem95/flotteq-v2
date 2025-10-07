import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        SMTP_HOST: 'smtp.test.com',
        SMTP_PORT: 587,
        SMTP_SECURE: 'false',
        SMTP_USER: 'test@test.com',
        SMTP_PASSWORD: 'password',
        EMAIL_FROM: 'noreply@test.com',
        APP_URL: 'http://localhost:3000',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load email templates on initialization', () => {
    expect(service['templates'].size).toBeGreaterThan(0);
    expect(service['templates'].has('welcome')).toBe(true);
    expect(service['templates'].has('maintenance-reminder')).toBe(true);
    expect(service['templates'].has('document-expiring')).toBe(true);
  });

  it('should have a layout template', () => {
    expect(service['layoutTemplate']).toBeDefined();
  });

  it('should configure SMTP transporter with correct settings', () => {
    expect(configService.get).toHaveBeenCalledWith('SMTP_HOST');
    expect(configService.get).toHaveBeenCalledWith('SMTP_PORT');
    expect(configService.get).toHaveBeenCalledWith('SMTP_USER');
    expect(configService.get).toHaveBeenCalledWith('SMTP_PASSWORD');
  });

  describe('sendEmail', () => {
    it('should throw error if template does not exist', async () => {
      const options = {
        to: 'test@example.com',
        subject: 'Test',
        template: 'non-existent',
        context: {},
      };

      await expect(service.sendEmail(options)).rejects.toThrow(
        'Template "non-existent" not found',
      );
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should prepare welcome email with correct context', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      await service.sendWelcomeEmail('user@example.com', 'John', 'Acme Corp');

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Bienvenue sur FlotteQ !',
        template: 'welcome',
        context: {
          firstName: 'John',
          tenantName: 'Acme Corp',
          email: 'user@example.com',
          appUrl: 'http://localhost:3000',
        },
      });

      sendEmailSpy.mockRestore();
    });
  });

  describe('sendMaintenanceReminder', () => {
    it('should prepare maintenance reminder with correct subject for tomorrow', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      const maintenanceData = {
        vehicleBrand: 'Renault',
        vehicleModel: 'Clio',
        vehiclePlate: 'AB-123-CD',
        maintenanceType: 'Vidange',
        maintenanceDate: '2025-10-06',
        maintenanceId: '123',
      };

      await service.sendMaintenanceReminder('user@example.com', 'John', maintenanceData, 1);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Rappel : Maintenance demain',
        template: 'maintenance-reminder',
        context: expect.objectContaining({
          firstName: 'John',
          daysUntil: 'demain',
          ...maintenanceData,
        }),
      });

      sendEmailSpy.mockRestore();
    });

    it('should prepare maintenance reminder with correct subject for 7 days', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      const maintenanceData = {
        vehicleBrand: 'Renault',
        maintenanceId: '123',
      };

      await service.sendMaintenanceReminder('user@example.com', 'John', maintenanceData, 7);

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Rappel : Maintenance dans 7 jours',
        }),
      );

      sendEmailSpy.mockRestore();
    });
  });

  describe('sendDocumentExpiringAlert', () => {
    it('should prepare document expiring alert with correct context', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      const documentData = {
        documentName: 'Carte grise',
        documentType: 'REGISTRATION',
        expirationDate: '2025-11-05',
        entityType: 'Vehicle',
        entityName: 'Renault Clio AB-123-CD',
        documentId: '456',
      };

      await service.sendDocumentExpiringAlert('user@example.com', 'John', documentData, 30);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Document expirant dans 30 jours',
        template: 'document-expiring',
        context: expect.objectContaining({
          firstName: 'John',
          daysUntil: 30,
          ...documentData,
        }),
      });

      sendEmailSpy.mockRestore();
    });
  });
});
