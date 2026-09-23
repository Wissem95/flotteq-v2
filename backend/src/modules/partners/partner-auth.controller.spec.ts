import { BadRequestException } from '@nestjs/common';
import { PartnerAuthController } from './partner-auth.controller';
import { PartnerDocumentType } from '../../entities/partner-document.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';

describe('PartnerAuthController registration documents', () => {
  const partnerAuthService = {} as any;
  const partnersService = { create: jest.fn() };
  const controller = new PartnerAuthController(
    partnerAuthService,
    partnersService as any,
  );
  const registration = {
    companyName: 'Garage Test',
    type: 'garage',
    email: 'contact@example.fr',
    phone: '+33612345678',
    address: '1 rue du Test',
    city: 'Paris',
    postalCode: '75001',
    siretNumber: '12345678901234',
    ownerFirstName: 'Alice',
    ownerLastName: 'Test',
    ownerEmail: 'alice@example.fr',
    ownerPassword: 'SecurePassword123!',
    documentType: PartnerDocumentType.SIRET,
  } as CreatePartnerDto;

  beforeEach(() => jest.clearAllMocks());

  it('refuse une inscription publique sans justificatif', async () => {
    await expect(
      controller.register(registration, { documents: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(partnersService.create).not.toHaveBeenCalled();
  });

  it('transmet le fichier et son type au service transactionnel', async () => {
    const pdf = Buffer.from('%PDF-1.4 synthetic proof');
    const file = {
      originalname: 'siret.pdf',
      mimetype: 'application/pdf',
      size: pdf.length,
      buffer: pdf,
    } as Express.Multer.File;

    await controller.register(registration, { documents: [file] });

    expect(partnersService.create).toHaveBeenCalledWith(
      registration,
      [file],
      PartnerDocumentType.SIRET,
    );
  });
});
