import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePromotionsTable1771400100000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TYPE "discount_type_enum" AS ENUM('PERCENTAGE', 'FIXED')`);

		await queryRunner.createTable(
			new Table({
				name: "promotions",
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
					{ name: "establishment_id", type: "uuid", isNullable: false },
					{ name: "title", type: "varchar", length: "150", isNullable: false },
					{ name: "description", type: "text", isNullable: true },
					{ name: "discount_type", type: "enum", enum: ["PERCENTAGE", "FIXED"], enumName: "discount_type_enum", isNullable: false },
					{ name: "discount_value", type: "integer", isNullable: false, comment: "% inteiro ou centavos" },
					{ name: "starts_at", type: "timestamp", isNullable: false },
					{ name: "ends_at", type: "timestamp", isNullable: false },
					{ name: "active", type: "boolean", default: true },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", isNullable: true },
				],
			}),
		);

		await queryRunner.createForeignKey(
			"promotions",
			new TableForeignKey({
				columnNames: ["establishment_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "establishments",
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			}),
		);

		// Join table promotions <-> services
		await queryRunner.createTable(
			new Table({
				name: "promotion_services",
				columns: [
					{ name: "promotion_id", type: "uuid", isPrimary: true },
					{ name: "service_id", type: "uuid", isPrimary: true },
				],
			}),
		);

		await queryRunner.createForeignKey(
			"promotion_services",
			new TableForeignKey({
				columnNames: ["promotion_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "promotions",
				onDelete: "CASCADE",
			}),
		);

		await queryRunner.createForeignKey(
			"promotion_services",
			new TableForeignKey({
				columnNames: ["service_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "services",
				onDelete: "CASCADE",
			}),
		);

		// Index for performance on date-range queries
		await queryRunner.query(`CREATE INDEX idx_promotions_establishment_dates ON promotions (establishment_id, starts_at, ends_at)`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX IF EXISTS idx_promotions_establishment_dates`);
		await queryRunner.dropTable("promotion_services", true);
		await queryRunner.dropTable("promotions", true);
		await queryRunner.query(`DROP TYPE "discount_type_enum"`);
	}
}
