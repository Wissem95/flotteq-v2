import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddExpiryFieldsToDocument1759800000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Créer l'enum DocumentType
    await queryRunner.query(`
      CREATE TYPE "document_type_enum" AS ENUM (
        'permis',
        'carte_grise',
        'assurance',
        'controle_technique',
        'facture',
        'contrat',
        'autre'
      )
    `);

    // Ajouter les nouvelles colonnes
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'document_type',
        type: 'enum',
        enum: [
          'permis',
          'carte_grise',
          'assurance',
          'controle_technique',
          'facture',
          'contrat',
          'autre',
        ],
        enumName: 'document_type_enum',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'expiry_date',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'notes',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes
    await queryRunner.dropColumn('documents', 'notes');
    await queryRunner.dropColumn('documents', 'expiry_date');
    await queryRunner.dropColumn('documents', 'document_type');

    // Supprimer l'enum
    await queryRunner.query(`DROP TYPE "document_type_enum"`);
  }
}
