import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentEntityType } from '../entities/document.entity';

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
    });

    return this.documentsRepository.save(document);
  }

  async findAll(
    tenantId: number,
    entityType?: DocumentEntityType,
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
}
