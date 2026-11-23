import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableCitextExtension1700000000000 implements MigrationInterface {
  name = 'EnableCitextExtension1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "citext"');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION IF EXISTS "pgcrypto"');
    await queryRunner.query('DROP EXTENSION IF EXISTS "citext"');
  }
}
