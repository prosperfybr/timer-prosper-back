import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateAbsenceBlocksTable1762984128324 implements MigrationInterface {
	private readonly TABLE_NAME = "absence_blocks";
	private readonly COLLABORATOR_ID_COLUMN = "collaborator_id";
	private readonly SERVICE_ID_COLUMN = "service_id";
	private readonly ESTABLISHMENT_ID_COLUMN = "service_id";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: this.TABLE_NAME,
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },

					// Vínculos (pelo menos um deve ser preenchido)
					{ name: this.COLLABORATOR_ID_COLUMN, type: "uuid", isNullable: true },
					{ name: this.SERVICE_ID_COLUMN, type: "uuid", isNullable: true },
					{ name: this.ESTABLISHMENT_ID_COLUMN, type: "uuid", isNullable: true },

					// Detalhes de Tempo e Recorrência
					{ name: "start_time", type: "varchar", isNullable: true },
					// Pode ser nulo para bloqueios que duram o dia todo ou que são recorrentes sem data de fim (UNTIL)
					{ name: "end_time", type: "varchar", isNullable: true },

					{ name: "description", type: "varchar", length: "255", isNullable: true },

					// Regras de Gestão
					{ name: "is_recurrent", type: "boolean", default: false, isNullable: false },
					{ name: "recurrence_rule", type: "varchar", isNullable: true },
					{ name: "is_active", type: "boolean", default: true, isNullable: false },

					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", default: "now()" },
				],
				indices: [
					{ columnNames: [this.COLLABORATOR_ID_COLUMN, "is_recurrent", "is_active"] },
					{ columnNames: [this.SERVICE_ID_COLUMN, "is_recurrent", "is_active"] },
				],
			}),
			true,
		);

		await queryRunner.createForeignKey(
			this.TABLE_NAME,
			new TableForeignKey({
				columnNames: [this.COLLABORATOR_ID_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: "collaborators",
				onDelete: "SET NULL",
			}),
		);

		await queryRunner.createForeignKey(
			this.TABLE_NAME,
			new TableForeignKey({
				columnNames: [this.SERVICE_ID_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: "services",
				onDelete: "SET NULL",
			}),
		);

		await queryRunner.createForeignKey(
			this.TABLE_NAME,
			new TableForeignKey({
				columnNames: [this.ESTABLISHMENT_ID_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: "establishments",
				onDelete: "SET NULL",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable(this.TABLE_NAME);
	}
}
