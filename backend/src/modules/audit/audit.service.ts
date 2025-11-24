import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create({
        ...createAuditLogDto,
        createdAt: new Date(),
      });
      return await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      throw error;
    }
  }

  async findAll(
    tenantId: number,
    filters: AuditLogFilterDto,
  ): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      userId,
      entityType,
      entityId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .where('audit.tenant_id = :tenantId', { tenantId });

    if (userId) {
      query.andWhere('audit.user_id = :userId', { userId });
    }

    if (entityType) {
      query.andWhere('audit.entity_type = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('audit.entity_id = :entityId', { entityId });
    }

    if (action) {
      query.andWhere('audit.action = :action', { action });
    }

    if (startDate && endDate) {
      query.andWhere('audit.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    query
      .orderBy('audit.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByEntity(
    tenantId: number,
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
