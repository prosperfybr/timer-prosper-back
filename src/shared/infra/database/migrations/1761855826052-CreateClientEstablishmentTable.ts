import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateClientEstablishmentTable1761855826052 implements MigrationInterface {
	private readonly TABLE_NAME = "client_establishments";
	private readonly CLIENT_ID_COLUMN = "user_id";
	private readonly ESTABLISHMENT_ID_COLUMN = "establishment_id";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: this.TABLE_NAME,
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
					{ name: this.CLIENT_ID_COLUMN, type: "uuid", isNullable: false },
					{ name: this.ESTABLISHMENT_ID_COLUMN, type: "uuid", isNullable: false },
					{ name: "status", type: "varchar", length: "10", default: "'pending'", isNullable: false }, // 'pending' | 'approved' | 'rejected'
					{ name: "requested_by", type: "varchar", length: "12", isNullable: false }, // 'client' | 'establishment'
					{ name: "requested_at", type: "timestamp", default: "now()", isNullable: false },
					{ name: "approved_at", type: "timestamp", isNullable: true },
					{ name: "rejected_at", type: "timestamp", isNullable: true },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", isNullable: true },
				],
				// Índice composto para garantir que um cliente só se relacione uma vez com um estabelecimento
				uniques: [{ columnNames: [this.CLIENT_ID_COLUMN, this.ESTABLISHMENT_ID_COLUMN] }],
			}),
			true
		);

		// FK para 'client_profiles'
		await queryRunner.createForeignKey(
			this.TABLE_NAME,
			new TableForeignKey({
				columnNames: [this.CLIENT_ID_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: "users",
				onDelete: "CASCADE",
			})
		);

		// FK para 'establishments'
		await queryRunner.createForeignKey(
			this.TABLE_NAME,
			new TableForeignKey({
				columnNames: [this.ESTABLISHMENT_ID_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: "establishments",
				onDelete: "CASCADE",
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Definição das FKs para remoção
		const clientForeignKey = new TableForeignKey({
			columnNames: [this.CLIENT_ID_COLUMN],
			referencedColumnNames: ["id"],
			referencedTableName: "client_profiles",
		});
		const establishmentForeignKey = new TableForeignKey({
			columnNames: [this.ESTABLISHMENT_ID_COLUMN],
			referencedColumnNames: ["id"],
			referencedTableName: "establishments",
		});

		// Remove as FKs
		await queryRunner.dropForeignKey(this.TABLE_NAME, clientForeignKey);
		await queryRunner.dropForeignKey(this.TABLE_NAME, establishmentForeignKey);

		// Remove a tabela
		await queryRunner.dropTable(this.TABLE_NAME);
	}
}
