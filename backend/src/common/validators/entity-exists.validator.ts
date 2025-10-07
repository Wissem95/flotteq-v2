import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Validator pour vérifier qu'un UUID existe en DB
 *
 * Usage:
 * @EntityExists('Vehicle')
 * vehicleId: string;
 */
@ValidatorConstraint({ name: 'EntityExists', async: true })
@Injectable()
export class EntityExistsConstraint implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) return false;

    const [entityClass] = args.constraints;
    const repository = this.dataSource.getRepository(entityClass);

    try {
      const entity = await repository.findOne({ where: { id: value } });
      return !!entity;
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [entityClass] = args.constraints;
    return `${entityClass} avec l'ID $value n'existe pas`;
  }
}

export function EntityExists(
  entityClass: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass],
      validator: EntityExistsConstraint,
    });
  };
}
