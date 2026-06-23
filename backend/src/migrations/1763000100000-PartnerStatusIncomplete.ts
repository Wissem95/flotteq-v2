import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Ajoute la valeur "incomplete" à l'enum de statut des partenaires.
 * Permet d'afficher "Configuration incomplète" quand l'onboarding bancaire
 * n'est pas terminé, au lieu de "suspendu" (qui reste réservé à une action admin).
 */
export class PartnerStatusIncomplete1763000100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // PG 12+ : ADD VALUE supporté ; IF NOT EXISTS évite l'erreur si déjà présent.
    await queryRunner.query(
      `ALTER TYPE "partner_status" ADD VALUE IF NOT EXISTS 'incomplete'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres ne permet pas de retirer une valeur d'enum simplement.
    // Pas de rollback automatique (no-op).
  }
}
