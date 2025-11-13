import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCollaboratorAvailabilityTable1762984112795 implements MigrationInterface {
	private readonly TABLE_NAME = "collaborator_availabilities";
	private readonly COLLABORATOR_ID_COLUMN = "collaborator_id";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: this.TABLE_NAME,
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
					{ name: this.COLLABORATOR_ID_COLUMN, type: "uuid", isNullable: false },
					// 1=Segunda, 7=Domingo
					{ name: "day_of_week", type: "integer", isNullable: false },
					{ name: "start_time", type: "time", isNullable: false },
					{ name: "end_time", type: "time", isNullable: false },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", isNullable: true },
				],
				// Índice para otimizar a busca por disponibilidade
				indices: [{ columnNames: [this.COLLABORATOR_ID_COLUMN, "day_of_week"] }],
			}),
			true
		);

		// FK para 'collaborator_profiles'
		await queryRunner.createForeignKey(
			this.TABLE_NAME,
			new TableForeignKey({
				columnNames: [this.COLLABORATOR_ID_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: "collaborator_profiles",
				onDelete: "CASCADE",
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable(this.TABLE_NAME);
	}
}
