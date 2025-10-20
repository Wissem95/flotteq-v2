import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStripeFieldsToPartners1760917000000 implements MigrationInterface {
  name = 'AddStripeFieldsToPartners1760917000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter stripe_account_id (Stripe Connect Account ID)
    await queryRunner.addColumn(
      'partners',
      new TableColumn({
        name: 'stripe_account_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Ajouter stripe_onboarding_completed
    await queryRunner.addColumn(
      'partners',
      new TableColumn({
        name: 'stripe_onboarding_completed',
        type: 'boolean',
        default: false,
      }),
    );

    // Vérifier si commission_rate existe déjà
    const table = await queryRunner.getTable('partners');
    const hasCommissionRate = table?.columns.find(
      (col) => col.name === 'commission_rate',
    );

    // Ajouter commission_rate uniquement si elle n'existe pas
    if (!hasCommissionRate) {
      await queryRunner.addColumn(
        'partners',
        new TableColumn({
          name: 'commission_rate',
          type: 'decimal',
          precision: 5,
          scale: 2,
          default: 10.00,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('partners', 'stripe_account_id');
    await queryRunner.dropColumn('partners', 'stripe_onboarding_completed');
    // Ne pas supprimer commission_rate car il pourrait exister avant cette migration
  }
}
