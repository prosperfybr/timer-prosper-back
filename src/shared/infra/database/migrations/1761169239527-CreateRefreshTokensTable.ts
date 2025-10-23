import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";
export class CreateRefreshTokensTable1761169239527 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "refresh_tokens",
				columns: [
					{
						name: "id",
						type: "uuid",
						isPrimary: true,
						default: "uuid_generate_v4()",
					},
					{
						name: "token_hash",
						type: "varchar",
						isUnique: true,
						isNullable: false,
					},
					{
						name: "is_revoked",
						type: "boolean",
						default: "false",
					},
					{
						name: "expires_at",
						type: "timestamp with time zone",
						isNullable: false,
					},
					{
						name: "client_ip",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "user_agent",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "created_at",
						type: "timestamp with time zone",
						default: "now()",
					},
					{
						name: "user_id",
						type: "uuid",
						isNullable: false,
					},
				],
			})
		);

		await queryRunner.createForeignKey(
			"refresh_tokens",
			new TableForeignKey({
				columnNames: ["user_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "users",
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const table = await queryRunner.getTable("refresh_tokens");
		const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("user_id") !== -1);

		if (foreignKey) {
			await queryRunner.dropForeignKey("refresh_tokens", foreignKey);
		}

		await queryRunner.dropTable("refresh_tokens");
	}
}
