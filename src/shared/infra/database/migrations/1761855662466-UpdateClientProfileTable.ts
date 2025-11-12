import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class UpdateClientProfileTable1761855662466 implements MigrationInterface {
	private readonly USER_TABLE = "users";

	public async up(queryRunner: QueryRunner): Promise<void> {

		await queryRunner.addColumns(
			this.USER_TABLE,
			[
				new TableColumn({ name: "whatsapp", type: "varchar", length: "20", isNullable: true }),
				new TableColumn({ name: "birth_date", type: "date", isNullable: true }),
				new TableColumn({ name: "cpf", type: "varchar", length: "14", isNullable: true }),
				new TableColumn({ name: "preferences", type: "text", isNullable: true }),
				new TableColumn({ name: "profile_complete", type: "boolean", default: false, isNullable: false }),
			]
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Remoção da FK e da tabela
		await queryRunner.dropTable(this.USER_TABLE);
	}
}
