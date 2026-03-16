import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePlanNameEnum1771400300000 implements MigrationInterface {
	public transaction = false;

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DO $$
			BEGIN
				IF NOT EXISTS (SELECT 1 FROM pg_type t 
							   JOIN pg_enum e ON t.oid = e.enumtypid 
							   WHERE t.typname = 'plan_name_enum' AND e.enumlabel = 'FREE') THEN
					ALTER TYPE "plan_name_enum" ADD VALUE 'FREE';
				END IF;
			END
			$$;
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Não é trivial remover valores de um ENUM no PostgreSQL sem recriar o tipo.
		// Em migrations de adição de valores de enum, o down costuma ser deixado vazio.
	}
}
