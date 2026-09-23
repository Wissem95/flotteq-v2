import { QueryRunner } from 'typeorm';
import { CreateDocumentsTable1759750000000 } from './1759750000000-CreateDocumentsTable';

describe('CreateDocumentsTable1759750000000', () => {
  const queryRunner = {
    hasTable: jest.fn(),
    query: jest.fn(),
  } as unknown as QueryRunner;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('n’altère pas une table documents historique déjà présente', async () => {
    jest.mocked(queryRunner.hasTable).mockResolvedValue(true);

    await new CreateDocumentsTable1759750000000().up(queryRunner);

    expect(queryRunner.hasTable).toHaveBeenCalledWith('documents');
    expect(queryRunner.query).not.toHaveBeenCalled();
  });

  it('crée la table et tolère des types enum déjà présents', async () => {
    jest.mocked(queryRunner.hasTable).mockResolvedValue(false);

    await new CreateDocumentsTable1759750000000().up(queryRunner);

    expect(queryRunner.query).toHaveBeenCalledTimes(3);
    expect(jest.mocked(queryRunner.query).mock.calls[0][0]).toContain(
      'WHEN duplicate_object THEN NULL',
    );
    expect(jest.mocked(queryRunner.query).mock.calls[2][0]).toContain(
      'CREATE TABLE "documents"',
    );
  });
});
