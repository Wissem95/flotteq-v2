import { QueryRunner } from 'typeorm';
import { EnsureTenantTrialEndsAt1763001200000 } from '../../migrations/1763001200000-EnsureTenantTrialEndsAt';

describe('EnsureTenantTrialEndsAt1763001200000', () => {
  it('ajoute la colonne requise par Tenant lorsqu’un schéma historique ne la contient pas', async () => {
    const queryRunner = {
      query: jest.fn(),
    } as unknown as QueryRunner;

    await new EnsureTenantTrialEndsAt1763001200000().up(queryRunner);

    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining(
        'ADD COLUMN IF NOT EXISTS "trial_ends_at" TIMESTAMP',
      ),
    );
  });
});
