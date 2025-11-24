import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DocumentEntityType } from '../../entities/document.entity';

/**
 * Validator spécifique pour documents
 * Valide que entityId existe selon entityType
 *
 * Usage dans DTO:
 * @ValidateDocumentEntity()
 * entityId: string;
 */
@ValidatorConstraint({ name: 'ValidateDocumentEntity', async: true })
@Injectable()
export class DocumentEntityExistsConstraint
  implements ValidatorConstraintInterface
{
  constructor(private dataSource: DataSource) {}

  async validate(
    entityId: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    if (!entityId) return false;

    const object = args.object as any;
    const entityType: DocumentEntityType = object.entityType;

    if (!entityType) {
      // entityType manquant, laisse @IsEnum() gérer
      return true;
    }

    // Map entityType vers nom d'entity
    const entityMap: Record<DocumentEntityType, string | null> = {
      [DocumentEntityType.VEHICLE]: 'Vehicle',
      [DocumentEntityType.DRIVER]: 'Driver',
      [DocumentEntityType.MAINTENANCE]: 'Maintenance',
      [DocumentEntityType.PARTNER]: null, // Partners will be validated in Sprint 2
      [DocumentEntityType.PARTNER_SERVICE]: null, // Partner services will be validated in Sprint 2
    };

    const entityName = entityMap[entityType];
    if (!entityName) {
      // For partner entities, skip validation (will be implemented in Sprint 2)
      return (
        entityType === DocumentEntityType.PARTNER ||
        entityType === DocumentEntityType.PARTNER_SERVICE
      );
    }

    try {
      const repository = this.dataSource.getRepository(entityName);
      const entity = await repository.findOne({ where: { id: entityId } });
      return !!entity;
    } catch (error) {
      console.error(`Validation FK error for ${entityName}:`, error.message);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const object = args.object as any;
    const entityType = object.entityType;
    return `${entityType} avec l'ID ${args.value} n'existe pas en base de données`;
  }
}

export function ValidateDocumentEntity(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: DocumentEntityExistsConstraint,
    });
  };
}
