import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentsService } from '../../documents/documents.service';
import { DocumentVerificationStatus } from '../../entities/document.entity';
import {
  PartnerDocument,
  PartnerDocumentVerificationStatus,
} from '../../entities/partner-document.entity';
import {
  PartnerDocumentSource,
  VerifyPartnerDocumentDto,
} from './dto/verify-partner-document.dto';

@Injectable()
export class PartnerDocumentsService {
  constructor(
    @InjectRepository(PartnerDocument)
    private readonly partnerDocumentsRepository: Repository<PartnerDocument>,
    private readonly documentsService: DocumentsService,
  ) {}

  async findByPartner(partnerId: string) {
    const [registrationDocuments, legacyDocuments] = await Promise.all([
      this.partnerDocumentsRepository.find({
        where: { partnerId },
        order: { createdAt: 'DESC' },
      }),
      this.documentsService.findByEntity('partner', partnerId),
    ]);

    return [
      ...registrationDocuments.map((document) => ({
        id: document.id,
        fileName: document.fileName,
        mimeType: document.mimeType,
        size: document.size,
        documentType: document.documentType,
        createdAt: document.createdAt,
        verificationStatus: document.verificationStatus,
        verificationNotes: document.verificationNotes,
        source: 'registration' as const,
      })),
      ...legacyDocuments.map((document) => ({
        id: document.id,
        fileName: document.fileName,
        mimeType: document.mimeType,
        size: document.size,
        documentType: document.documentType || 'autre',
        createdAt: document.createdAt,
        verificationStatus: document.verificationStatus,
        verificationNotes: document.verificationNotes,
        source: 'legacy' as const,
      })),
    ].sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );
  }

  async verify(
    partnerId: string,
    documentId: string,
    dto: VerifyPartnerDocumentDto,
    verifiedById: string,
  ) {
    if (dto.source === PartnerDocumentSource.LEGACY) {
      const legacyDocument = (
        await this.documentsService.findByEntity('partner', partnerId)
      ).find((document) => document.id === documentId);
      if (!legacyDocument) throw new NotFoundException('Document non trouvé');
      const verified = await this.documentsService.verify(
        documentId,
        dto.status as unknown as DocumentVerificationStatus,
        verifiedById,
        dto.notes,
      );
      return {
        id: verified.id,
        fileName: verified.fileName,
        mimeType: verified.mimeType,
        size: verified.size,
        documentType: verified.documentType || 'autre',
        createdAt: verified.createdAt,
        verificationStatus: verified.verificationStatus,
        verificationNotes: verified.verificationNotes,
        source: PartnerDocumentSource.LEGACY,
      };
    }

    const document = await this.partnerDocumentsRepository.findOne({
      where: { id: documentId, partnerId },
    });
    if (!document) throw new NotFoundException('Document non trouvé');

    document.verificationStatus = dto.status;
    document.verificationNotes = dto.notes || null;
    document.verifiedById = verifiedById;
    document.verifiedAt = new Date();
    const verified = await this.partnerDocumentsRepository.save(document);
    return {
      id: verified.id,
      fileName: verified.fileName,
      mimeType: verified.mimeType,
      size: verified.size,
      documentType: verified.documentType,
      createdAt: verified.createdAt,
      verificationStatus: verified.verificationStatus,
      verificationNotes: verified.verificationNotes,
      source: PartnerDocumentSource.REGISTRATION,
    };
  }

  async getDownload(
    partnerId: string,
    documentId: string,
    source: PartnerDocumentSource,
  ) {
    if (
      source !== PartnerDocumentSource.LEGACY &&
      source !== PartnerDocumentSource.REGISTRATION
    ) {
      throw new BadRequestException('Source de document invalide');
    }
    if (source === PartnerDocumentSource.LEGACY) {
      const document = (
        await this.documentsService.findByEntity('partner', partnerId)
      ).find((entry) => entry.id === documentId);
      if (!document) throw new NotFoundException('Document non trouvé');
      return {
        filePath: document.fileUrl,
        fileName: document.fileName,
        mimeType: document.mimeType,
      };
    }

    const document = await this.partnerDocumentsRepository.findOne({
      where: { id: documentId, partnerId },
    });
    if (!document) throw new NotFoundException('Document non trouvé');
    return {
      filePath: document.filePath,
      fileName: document.fileName,
      mimeType: document.mimeType,
    };
  }
}
