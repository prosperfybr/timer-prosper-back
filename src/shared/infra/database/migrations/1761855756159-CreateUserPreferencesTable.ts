import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateUserPreferencesTable1761855756159 implements MigrationInterface {
	private readonly TABLE_NAME = "user_preferences";
	private readonly USER_ID_COLUMN = "user_id";
	private readonly USER_TABLE = "users";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: this.TABLE_NAME,
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
					{ name: this.USER_ID_COLUMN, type: "uuid", isNullable: false, isUnique: true },
					{ name: "dark_mode", type: "boolean", default: false, isNullable: false },
					{ name: "email_notifications", type: "boolean", default: true, isNullable: false },
					{ name: "whatsapp_notifications", type: "boolean", default: true, isNullable: false },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", isNullable: true },
				],
			}),
			true
		);

		// Chave Estrangeira para a tabela 'users'
		await queryRunner.createForeignKey(
			this.TABLE_NAME,
			new TableForeignKey({
				columnNames: [this.USER_ID_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: this.USER_TABLE,
				onDelete: "CASCADE",
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Remoção da FK e da tabela
		const foreignKey = new TableForeignKey({
			columnNames: [this.USER_ID_COLUMN],
			referencedColumnNames: ["id"],
			referencedTableName: this.USER_TABLE,
		});

		await queryRunner.dropForeignKey(this.TABLE_NAME, foreignKey);
		await queryRunner.dropTable(this.TABLE_NAME);
	}
}
