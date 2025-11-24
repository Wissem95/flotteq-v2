import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { DocumentEntityExistsConstraint } from './document-entity-exists.validator';
import { DocumentEntityType } from '../../entities/document.entity';
import { ValidationArguments } from 'class-validator';

describe('DocumentEntityExistsConstraint', () => {
  let constraint: DocumentEntityExistsConstraint;
  let dataSource: jest.Mocked<DataSource>;
  let mockRepository: jest.Mocked<Repository<any>>;

  beforeEach(async () => {
    mockRepository = { findOne: jest.fn() } as any;
    dataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentEntityExistsConstraint,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    constraint = module.get(DocumentEntityExistsConstraint);
  });

  const createValidationArgs = (
    entityType: DocumentEntityType,
    entityId: string,
  ): ValidationArguments => ({
    value: entityId,
    object: { entityType },
    constraints: [],
    property: 'entityId',
    targetName: 'UploadDocumentDto',
  });

  it('should return true when vehicle exists', async () => {
    mockRepository.findOne.mockResolvedValue({ id: 'valid-uuid' });
    const args = createValidationArgs(DocumentEntityType.VEHICLE, 'valid-uuid');

    const result = await constraint.validate('valid-uuid', args);

    expect(result).toBe(true);
    expect(dataSource.getRepository).toHaveBeenCalledWith('Vehicle');
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'valid-uuid' },
    });
  });

  it('should return false when vehicle does not exist', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    const args = createValidationArgs(
      DocumentEntityType.VEHICLE,
      'invalid-uuid',
    );

    const result = await constraint.validate('invalid-uuid', args);

    expect(result).toBe(false);
  });

  it('should return true when driver exists', async () => {
    mockRepository.findOne.mockResolvedValue({ id: 'driver-uuid' });
    const args = createValidationArgs(DocumentEntityType.DRIVER, 'driver-uuid');

    const result = await constraint.validate('driver-uuid', args);

    expect(result).toBe(true);
    expect(dataSource.getRepository).toHaveBeenCalledWith('Driver');
  });

  it('should return true when maintenance exists', async () => {
    mockRepository.findOne.mockResolvedValue({ id: 'maintenance-uuid' });
    const args = createValidationArgs(
      DocumentEntityType.MAINTENANCE,
      'maintenance-uuid',
    );

    const result = await constraint.validate('maintenance-uuid', args);

    expect(result).toBe(true);
    expect(dataSource.getRepository).toHaveBeenCalledWith('Maintenance');
  });

  it('should return true when entityType is missing', async () => {
    const args: ValidationArguments = {
      value: 'some-uuid',
      object: {}, // Pas de entityType
      constraints: [],
      property: 'entityId',
      targetName: 'UploadDocumentDto',
    };

    const result = await constraint.validate('some-uuid', args);

    expect(result).toBe(true); // Délègue à @IsEnum
    expect(dataSource.getRepository).not.toHaveBeenCalled();
  });

  it('should return false when repository throws error', async () => {
    mockRepository.findOne.mockRejectedValue(new Error('DB connection lost'));
    const args = createValidationArgs(DocumentEntityType.VEHICLE, 'uuid');

    const result = await constraint.validate('uuid', args);

    expect(result).toBe(false);
  });
});
