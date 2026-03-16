import { MigrationInterface, QueryRunner } from "typeorm";
import { PlanNameEnum } from "@modules/plans/models/enum/plan-name.enum";

export class SeedFreePlan1771400400000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			INSERT INTO "plans" (
				"id", "name", "description", "monthly_price", "annual_discount", 
				"max_clients", "has_ai_scheduler", "has_feedback_collector", 
				"has_custom_website", "popular", "features", "active"
			) VALUES (
				uuid_generate_v4(), 
				'${PlanNameEnum.FREE}', 
				'Período de teste gratuito por 14 dias para você conhecer todas as funcionalidades essenciais.',
				0, 
				0.0000, 
				50, 
				false, 
				false, 
				false, 
				false, 
				'{"50 Clientes Máximo", "Gestão de Agendamentos", "Suporte Básico", "Teste Grátis por 14 dias"}', 
				true
			)
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DELETE FROM "plans" WHERE "name" = '${PlanNameEnum.FREE}'`);
	}
}
