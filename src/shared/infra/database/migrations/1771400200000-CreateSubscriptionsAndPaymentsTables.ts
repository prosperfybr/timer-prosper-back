import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateSubscriptionsAndPaymentsTables1771400200000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Enums
		await queryRunner.query(`CREATE TYPE "billing_period_enum" AS ENUM('MONTHLY', 'ANNUAL')`);
		await queryRunner.query(`CREATE TYPE "subscription_status_enum" AS ENUM('ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED')`);
		await queryRunner.query(`CREATE TYPE "payment_status_enum" AS ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED')`);

		// Subscriptions Table
		await queryRunner.createTable(
			new Table({
				name: "subscriptions",
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
					{ name: "establishment_id", type: "uuid", isNullable: false },
					{ name: "plan_id", type: "uuid", isNullable: false },
					{ name: "billing_period", type: "enum", enumName: "billing_period_enum", isNullable: false },
					{ name: "status", type: "enum", enumName: "subscription_status_enum", default: "'ACTIVE'" },
					{ name: "start_date", type: "timestamp", default: "now()" },
					{ name: "end_date", type: "timestamp", isNullable: true },
					{ name: "next_billing_date", type: "timestamp", isNullable: true },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", isNullable: true },
				],
			}),
		);

		await queryRunner.createForeignKey(
			"subscriptions",
			new TableForeignKey({
				columnNames: ["establishment_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "establishments",
				onDelete: "CASCADE",
			}),
		);

		await queryRunner.createForeignKey(
			"subscriptions",
			new TableForeignKey({
				columnNames: ["plan_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "plans",
				onDelete: "RESTRICT",
			}),
		);

		// Payments Table
		await queryRunner.createTable(
			new Table({
				name: "payments",
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
					{ name: "subscription_id", type: "uuid", isNullable: false },
					{ name: "external_transaction_id", type: "varchar", isNullable: true },
					{ name: "amount", type: "integer", isNullable: false },
					{ name: "status", type: "enum", enumName: "payment_status_enum", default: "'PENDING'" },
					{ name: "payment_method", type: "varchar", isNullable: true },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", isNullable: true },
				],
			}),
		);

		await queryRunner.createForeignKey(
			"payments",
			new TableForeignKey({
				columnNames: ["subscription_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "subscriptions",
				onDelete: "CASCADE",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("payments");
		await queryRunner.dropTable("subscriptions");
		await queryRunner.query(`DROP TYPE "payment_status_enum"`);
		await queryRunner.query(`DROP TYPE "subscription_status_enum"`);
		await queryRunner.query(`DROP TYPE "billing_period_enum"`);
	}
}
