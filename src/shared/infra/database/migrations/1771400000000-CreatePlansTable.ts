import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePlansTable1771400000000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Create enum type
		await queryRunner.query(`CREATE TYPE "plan_name_enum" AS ENUM('BASIC', 'PROFESSIONAL', 'ENTERPRISE')`);

		await queryRunner.createTable(
			new Table({
				name: "plans",
				columns: [
					{
						name: "id",
						type: "uuid",
						isPrimary: true,
						default: "uuid_generate_v4()",
					},
					{
						name: "name",
						type: "enum",
						enum: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
						enumName: "plan_name_enum",
						isNullable: false,
						isUnique: true,
					},
					{
						name: "description",
						type: "text",
						isNullable: false,
					},
					{
						name: "monthly_price",
						type: "integer",
						isNullable: false,
						comment: "Preço mensal em centavos",
					},
					{
						name: "annual_discount",
						type: "decimal",
						precision: 5,
						scale: 4,
						isNullable: false,
						default: 0.17,
						comment: "Desconto anual decimal ex: 0.17 = 17%",
					},
					{
						name: "max_clients",
						type: "integer",
						isNullable: true,
						comment: "Máximo de clientes. null = ilimitado",
					},
					{
						name: "has_ai_scheduler",
						type: "boolean",
						default: false,
					},
					{
						name: "has_feedback_collector",
						type: "boolean",
						default: false,
					},
					{
						name: "has_custom_website",
						type: "boolean",
						default: false,
					},
					{
						name: "popular",
						type: "boolean",
						default: false,
					},
					{
						name: "features",
						type: "text",
						isArray: true,
						default: "'{}'",
					},
					{
						name: "active",
						type: "boolean",
						default: true,
					},
					{
						name: "created_at",
						type: "timestamp",
						default: "now()",
					},
					{
						name: "updated_at",
						type: "timestamp",
						isNullable: true,
					},
				],
			}),
		);

		// Seed — 3 initial plans
		await queryRunner.query(`
			INSERT INTO plans (name, description, monthly_price, annual_discount, max_clients, has_ai_scheduler, has_feedback_collector, has_custom_website, popular, features, active)
			VALUES
				(
					'BASIC',
					'Perfeito para começar',
					12700,
					0.17,
					100,
					false,
					false,
					false,
					false,
					ARRAY['Até 100 clientes', 'Agendamento online', 'Notificações por email', 'Relatórios básicos', 'Suporte por email'],
					true
				),
				(
					'PROFESSIONAL',
					'Para negócios em crescimento',
					35700,
					0.17,
					500,
					true,
					true,
					false,
					true,
					ARRAY['Até 500 clientes', 'Todos os recursos do Básico', 'IA Agendador inteligente', 'Coletor de Feedback', 'Relatórios avançados', 'Notificações por SMS', 'Suporte prioritário'],
					true
				),
				(
					'ENTERPRISE',
					'Para grandes operações',
					52700,
					0.17,
					NULL,
					true,
					true,
					true,
					false,
					ARRAY['Clientes ilimitados', 'Todos os recursos do Profissional', 'Site próprio e personalizado', 'IA Agendador avançado', 'Coletor de Feedback premium', 'API personalizada', 'White label', 'Suporte 24/7', 'Gerente de conta dedicado'],
					true
				);
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("plans");
		await queryRunner.query(`DROP TYPE "plan_name_enum"`);
	}
}
