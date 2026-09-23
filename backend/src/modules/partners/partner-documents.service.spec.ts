import { NotFoundException } from '@nestjs/common';
import { PartnerDocumentsService } from './partner-documents.service';
import { PartnerDocumentSource } from './dto/verify-partner-document.dto';
import { PartnerDocumentVerificationStatus } from '../../entities/partner-document.entity';

describe('PartnerDocumentsService', () => {
  const repository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const documentsService = {
    findByEntity: jest.fn(),
    verify: jest.fn(),
  };
  const service = new PartnerDocumentsService(
    repository as any,
    documentsService as any,
  );

  beforeEach(() => jest.clearAllMocks());

  it('fusionne les justificatifs récents et historiques sans exposer leur chemin disque', async () => {
    repository.find.mockResolvedValue([
      {
        id: 'new-id',
        partnerId: 'partner-id',
        fileName: 'siret.pdf',
        filePath: '/private/uploads/siret.pdf',
        mimeType: 'application/pdf',
        size: 25,
        documentType: 'siret',
        createdAt: new Date('2026-09-22T12:00:00Z'),
        verificationStatus: 'pending',
        verificationNotes: null,
      },
    ]);
    documentsService.findByEntity.mockResolvedValue([
      {
        id: 'legacy-id',
        fileName: 'insurance.pdf',
        fileUrl: '/private/uploads/insurance.pdf',
        mimeType: 'application/pdf',
        size: 12,
        documentType: 'insurance_certificate',
        createdAt: new Date('2026-09-21T12:00:00Z'),
        verificationStatus: 'approved',
        verificationNotes: null,
      },
    ]);

    const documents = await service.findByPartner('partner-id');

    expect(repository.find).toHaveBeenCalledWith({
      where: { partnerId: 'partner-id' },
      order: { createdAt: 'DESC' },
    });
    expect(documents.map(({ id, source }) => [id, source])).toEqual([
      ['new-id', 'registration'],
      ['legacy-id', 'legacy'],
    ]);
    expect(documents[0]).not.toHaveProperty('filePath');
    expect(documents[1]).not.toHaveProperty('fileUrl');
  });

  it('ne permet pas de vérifier un document associé à un autre partenaire', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.verify(
        'partner-a',
        'document-of-partner-b',
        {
          source: PartnerDocumentSource.REGISTRATION,
          status: PartnerDocumentVerificationStatus.APPROVED,
        },
        'admin-id',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'document-of-partner-b', partnerId: 'partner-a' },
    });
    expect(repository.save).not.toHaveBeenCalled();
  });
});
