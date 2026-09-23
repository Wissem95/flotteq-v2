import { QueryRunner } from 'typeorm';
import { AlignCoreSchemaToEntities1763000800000 } from '../../migrations/1763000800000-AlignCoreSchemaToEntities';

describe('AlignCoreSchemaToEntities1763000800000', () => {
  const queryRunner = {
    query: jest.fn(),
  } as unknown as QueryRunner;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('résout le type enum réellement utilisé par commissions avant de le compléter', async () => {
    await new AlignCoreSchemaToEntities1763000800000().up(queryRunner);

    const queries = jest
      .mocked(queryRunner.query)
      .mock.calls.map(([query]) => String(query));
    const commissionEnumQuery = queries.find((query) =>
      query.includes('commission_status_type'),
    );

    expect(commissionEnumQuery).toContain('information_schema.columns');
    expect(commissionEnumQuery).toContain("table_name = 'commissions'");
    expect(commissionEnumQuery).toContain("column_name = 'status'");
    expect(commissionEnumQuery).toContain('ALTER TYPE %I ADD VALUE IF NOT EXISTS');
    expect(commissionEnumQuery).not.toContain('ALTER TYPE "commission_status"');
  });
});
