import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTimeBlockTable1762984128324 implements MigrationInterface {
	private readonly TABLE_NAME = "time_blocks";
	private readonly COLLABORATOR_ID_COLUMN = "collaborator_id";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: this.TABLE_NAME,
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
					{ name: this.COLLABORATOR_ID_COLUMN, type: "uuid", isNullable: false },
					{ name: "start_time", type: "timestamp", isNullable: false },
					{ name: "end_time", type: "timestamp", isNullable: false },
					{ name: "reason", type: "varchar", length: "150", isNullable: true },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", isNullable: true },
				],
				indices: [{ columnNames: [this.COLLABORATOR_ID_COLUMN, "start_time", "end_time"] }],
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
