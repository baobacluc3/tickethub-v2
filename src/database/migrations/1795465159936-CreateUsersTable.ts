import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1795465159936 implements MigrationInterface {
  name = 'CreateUsersTable1795465159936';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" citext NOT NULL,
        "password_hash" text NOT NULL,
        "role" text NOT NULL DEFAULT 'CUSTOMER',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "CHK_users_role" CHECK ("role" IN ('CUSTOMER', 'ORGANIZER')),
        CONSTRAINT "CHK_users_email_valid" CHECK (
          btrim("email"::text) <> ''
          AND "email"::text = btrim("email"::text)
          AND position('@' in "email"::text) > 1
        ),
        CONSTRAINT "CHK_users_password_hash_non_empty" CHECK (
          length(btrim("password_hash")) > 0
        )
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
  }
}
