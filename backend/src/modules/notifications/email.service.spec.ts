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
    expect(service['templates'].has('partner-welcome')).toBe(true);
    expect(service['templates'].has('partner-approved')).toBe(true);
    expect(service['templates'].has('partner-rejected')).toBe(true);
    expect(service['templates'].has('partner-booking-new')).toBe(true);
    expect(service['templates'].has('partner-booking-cancelled')).toBe(true);
    expect(service['templates'].has('booking-confirmed')).toBe(true);
    expect(service['templates'].has('booking-rejected')).toBe(true);
    expect(service['templates'].has('booking-completed')).toBe(true);
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

      await service.sendMaintenanceReminder(
        'user@example.com',
        'John',
        maintenanceData,
        1,
      );

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

      await service.sendMaintenanceReminder(
        'user@example.com',
        'John',
        maintenanceData,
        7,
      );

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

      await service.sendDocumentExpiringAlert(
        'user@example.com',
        'John',
        documentData,
        30,
      );

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

  describe('sendPartnerWelcomeEmail', () => {
    it('should prepare partner welcome email with correct context', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      await service.sendPartnerWelcomeEmail(
        'partner@example.com',
        'Jean',
        'Garage Dupont',
      );

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'partner@example.com',
        subject: 'Bienvenue Garage Dupont sur FlotteQ',
        template: 'partner-welcome',
        context: expect.objectContaining({
          firstName: 'Jean',
          companyName: 'Garage Dupont',
          email: 'partner@example.com',
        }),
      });

      sendEmailSpy.mockRestore();
    });
  });

  describe('sendPartnerApprovedEmail', () => {
    it('should prepare partner approved email with correct context', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      await service.sendPartnerApprovedEmail(
        'partner@example.com',
        'Jean',
        'Garage Dupont',
      );

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'partner@example.com',
        subject: 'Garage Dupont - Votre compte partenaire est approuvé !',
        template: 'partner-approved',
        context: expect.objectContaining({
          firstName: 'Jean',
          companyName: 'Garage Dupont',
        }),
      });

      sendEmailSpy.mockRestore();
    });
  });

  describe('sendPartnerRejectedEmail', () => {
    it('should prepare partner rejected email with rejection reason', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      await service.sendPartnerRejectedEmail(
        'partner@example.com',
        'Jean',
        'Garage Dupont',
        'Documents incomplets',
      );

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'partner@example.com',
        subject: 'Garage Dupont - Mise à jour de votre demande de partenariat',
        template: 'partner-rejected',
        context: expect.objectContaining({
          firstName: 'Jean',
          companyName: 'Garage Dupont',
          rejectionReason: 'Documents incomplets',
        }),
      });

      sendEmailSpy.mockRestore();
    });
  });

  describe('sendPartnerBookingNew', () => {
    it('should prepare new booking email for partner with booking details', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      const bookingData = {
        bookingId: 'BK-123',
        serviceName: 'Vidange complète',
        scheduledDate: '2025-10-20',
        scheduledTime: '14:00',
        vehicleRegistration: 'AB-123-CD',
        tenantName: 'FleetCorp',
        price: 89.99,
      };

      await service.sendPartnerBookingNew(
        'partner@example.com',
        'Garage Dupont',
        bookingData,
      );

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'partner@example.com',
        subject: 'Nouvelle réservation #BK-123',
        template: 'partner-booking-new',
        context: expect.objectContaining({
          companyName: 'Garage Dupont',
          bookingId: 'BK-123',
          serviceName: 'Vidange complète',
        }),
      });

      sendEmailSpy.mockRestore();
    });
  });

  describe('sendPartnerBookingCancelled', () => {
    it('should prepare booking cancellation email for partner', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      const bookingData = {
        bookingId: 'BK-456',
        serviceName: 'Révision',
        reason: 'Client a annulé',
        price: 150.0,
      };

      await service.sendPartnerBookingCancelled(
        'partner@example.com',
        'Garage Dupont',
        bookingData,
      );

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'partner@example.com',
        subject: 'Réservation annulée #BK-456',
        template: 'partner-booking-cancelled',
        context: expect.objectContaining({
          companyName: 'Garage Dupont',
          bookingId: 'BK-456',
          serviceName: 'Révision',
        }),
      });

      sendEmailSpy.mockRestore();
    });
  });

  describe('sendBookingConfirmed', () => {
    it('should prepare booking confirmed email for tenant', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      const bookingData = {
        bookingId: 'BK-789',
        partnerName: 'Garage Dupont',
        serviceName: 'Vidange',
      };

      await service.sendBookingConfirmed(
        'tenant@example.com',
        'FleetCorp',
        bookingData,
      );

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'tenant@example.com',
        subject: 'Réservation confirmée #BK-789',
        template: 'booking-confirmed',
        context: expect.objectContaining({
          tenantName: 'FleetCorp',
          bookingId: 'BK-789',
        }),
      });

      sendEmailSpy.mockRestore();
    });
  });

  describe('sendBookingRejected', () => {
    it('should prepare booking rejected email for tenant', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      const bookingData = {
        bookingId: 'BK-999',
        partnerName: 'Garage Dupont',
        serviceName: 'Révision',
        reason: 'Créneau non disponible',
      };

      await service.sendBookingRejected(
        'tenant@example.com',
        'FleetCorp',
        bookingData,
      );

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'tenant@example.com',
        subject: 'Réservation refusée #BK-999',
        template: 'booking-rejected',
        context: expect.objectContaining({
          tenantName: 'FleetCorp',
          bookingId: 'BK-999',
        }),
      });

      sendEmailSpy.mockRestore();
    });
  });

  describe('sendBookingCompleted', () => {
    it('should prepare booking completed email for tenant', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      const bookingData = {
        bookingId: 'BK-111',
        partnerName: 'Garage Dupont',
        serviceName: 'Vidange',
        price: 89.99,
        notes: 'Service effectué avec succès',
      };

      await service.sendBookingCompleted(
        'tenant@example.com',
        'FleetCorp',
        bookingData,
      );

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'tenant@example.com',
        subject: 'Service terminé #BK-111',
        template: 'booking-completed',
        context: expect.objectContaining({
          tenantName: 'FleetCorp',
          bookingId: 'BK-111',
          price: 89.99,
        }),
      });

      sendEmailSpy.mockRestore();
    });
  });
});
