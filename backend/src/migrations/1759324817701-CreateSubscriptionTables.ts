import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptionTables1759324817701
  implements MigrationInterface
{
  name = 'CreateSubscriptionTables1759324817701';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscription_plans" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "maxVehicles" integer NOT NULL, "maxUsers" integer NOT NULL, "maxDrivers" integer NOT NULL, "trialDays" integer NOT NULL DEFAULT '0', "features" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "stripeProductId" character varying, "stripePriceId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ae18a0f6e0143f06474aa8cef1f" UNIQUE ("name"), CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'unpaid')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" integer NOT NULL, "planId" integer NOT NULL, "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'active', "stripeSubscriptionId" character varying, "stripeCustomerId" character varying, "currentPeriodStart" date, "currentPeriodEnd" date, "trialEnd" date, "usage" jsonb NOT NULL DEFAULT '{}', "canceledAt" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c5fe8e5f9f4dd4a8c0134abc9" ON "subscriptions" ("tenantId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_0c5fe8e5f9f4dd4a8c0134abc9c" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_7536cba909dd7584a4640cad7d5" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_7536cba909dd7584a4640cad7d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_0c5fe8e5f9f4dd4a8c0134abc9c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0c5fe8e5f9f4dd4a8c0134abc9"`,
    );
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
    await queryRunner.query(`DROP TABLE "subscription_plans"`);
  }
}
