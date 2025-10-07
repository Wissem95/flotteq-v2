import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceTemplate } from './entities/maintenance-template.entity';
import { CreateMaintenanceTemplateDto } from './dto/create-template.dto';
import { UpdateMaintenanceTemplateDto } from './dto/update-template.dto';

@Injectable()
export class MaintenanceTemplateService {
  constructor(
    @InjectRepository(MaintenanceTemplate)
    private templateRepository: Repository<MaintenanceTemplate>,
  ) {}

  async create(createDto: CreateMaintenanceTemplateDto, tenantId: number): Promise<MaintenanceTemplate> {
    const template = this.templateRepository.create({
      ...createDto,
      tenantId,
    });
    return this.templateRepository.save(template);
  }

  async findAll(tenantId: number): Promise<MaintenanceTemplate[]> {
    return this.templateRepository.find({
      where: { tenantId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: number): Promise<MaintenanceTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async update(id: string, updateDto: UpdateMaintenanceTemplateDto, tenantId: number): Promise<MaintenanceTemplate> {
    const template = await this.findOne(id, tenantId);
    Object.assign(template, updateDto);
    return this.templateRepository.save(template);
  }

  async remove(id: string, tenantId: number): Promise<void> {
    const template = await this.findOne(id, tenantId);
    await this.templateRepository.remove(template);
  }
}
