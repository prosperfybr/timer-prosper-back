import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class CreateCollaboratosTable1762898412333 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "collaborators",
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()", comment: "ID do colaborador" },
					{ name: "user_id", type: "uuid", isUnique: true, isNullable: false },
					{ name: "establishment_id", type: "uuid", isNullable: false },
					{ name: "collaborator_function", type: "varchar", length: "50", isNullable: true },
					{ name: "specialty", type: "varchar", length: "70", isNullable: true },
					{ name: "hiring_date", type: "date", isNullable: true },
					{ name: "active", type: "boolean", isNullable: false, default: true },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", isNullable: true },
				],
			})
		);

		await queryRunner.createForeignKey(
			"collaborators",
			new TableForeignKey({
				columnNames: ["user_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "users",
				onDelete: "CASCADE",
			})
		);

		await queryRunner.createForeignKey(
			"collaborators",
			new TableForeignKey({
				columnNames: ["establishment_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "establishments",
				onDelete: "CASCADE",
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("collaborators");
	}
}
