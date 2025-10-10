import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Document, DocumentEntityType, DocumentType } from '../entities/document.entity';
import { ExpiringDocumentDto } from './dto/expiring-document.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async create(
    file: Express.Multer.File,
    entityType: DocumentEntityType,
    entityId: string,
    uploadedById: string,
    tenantId: number,
    dto?: Partial<UploadDocumentDto>,
  ): Promise<Document> {
    const document = this.documentsRepository.create({
      fileName: file.originalname,
      fileUrl: file.path,
      mimeType: file.mimetype,
      size: file.size,
      entityType,
      entityId,
      uploadedById,
      tenantId,
      documentType: dto?.documentType,
      expiryDate: dto?.expiryDate ? new Date(dto.expiryDate) : undefined,
      notes: dto?.notes,
    });

    return this.documentsRepository.save(document);
  }

  async findAll(
    tenantId: number,
    entityType?: string,
    entityId?: string,
  ): Promise<Document[]> {
    const query = this.documentsRepository
      .createQueryBuilder('document')
      .where('document.tenantId = :tenantId', { tenantId });

    if (entityType) {
      query.andWhere('document.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('document.entityId = :entityId', { entityId });
    }

    return query.getMany();
  }

  async findOne(id: string, tenantId: number): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }

    return document;
  }

  async remove(id: string, tenantId: number): Promise<void> {
    const document = await this.findOne(id, tenantId);
    await this.documentsRepository.softDelete(id);
  }

  /**
   * Calcule l'usage total de stockage pour un tenant
   * Exclut les fichiers soft-deleted
   */
  async getTenantStorageUsage(tenantId: number): Promise<number> {
    const result = await this.documentsRepository
      .createQueryBuilder('document')
      .select('SUM(document.size)', 'total')
      .where('document.tenantId = :tenantId', { tenantId })
      .andWhere('document.deletedAt IS NULL') // Exclure soft deleted
      .getRawOne();

    return parseInt(result?.total || '0', 10);
  }

  /**
   * Trouve les documents expirant bientôt
   * @param tenantId ID du tenant
   * @param days Nombre de jours avant expiration (défaut: 30)
   * @returns Liste des documents avec calcul de l'urgence
   */
  async findExpiringSoon(
    tenantId: number,
    days: number = 30,
  ): Promise<ExpiringDocumentDto[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const documents = await this.documentsRepository
      .createQueryBuilder('document')
      .where('document.tenantId = :tenantId', { tenantId })
      .andWhere('document.expiryDate IS NOT NULL')
      .andWhere('document.expiryDate > :today', { today })
      .andWhere('document.expiryDate <= :futureDate', { futureDate })
      .andWhere('document.deletedAt IS NULL')
      .orderBy('document.expiryDate', 'ASC')
      .getMany();

    return documents.map((doc) => {
      const daysUntilExpiry = Math.ceil(
        (doc.expiryDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      let urgencyLevel: 'critical' | 'warning' | 'info';
      if (daysUntilExpiry <= 7) {
        urgencyLevel = 'critical';
      } else if (daysUntilExpiry <= 15) {
        urgencyLevel = 'warning';
      } else {
        urgencyLevel = 'info';
      }

      return {
        id: doc.id,
        fileName: doc.fileName,
        documentType: doc.documentType!,
        entityType: doc.entityType,
        entityId: doc.entityId,
        expiryDate: doc.expiryDate!,
        daysUntilExpiry,
        urgencyLevel,
      };
    });
  }
}
