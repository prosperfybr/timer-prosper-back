import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateEstablishmentHourTable1763067045885 implements MigrationInterface {
	private readonly TABLE_NAME = "establishment_hours";
	private readonly ESTABLISHMENT_ID_COLUMN = "establishment_id";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: this.TABLE_NAME,
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
					{ name: this.ESTABLISHMENT_ID_COLUMN, type: "uuid", isNullable: false },
					{ name: "day_of_week", type: "integer", isNullable: false, comment: "Dias numéricos (1=Domingo, 7=Sábado)" },
					{ name: "opening_time", type: "time", isNullable: false },
					{ name: "closing_time", type: "time", isNullable: false },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", default: "now()" },
				],
				uniques: [{ columnNames: [this.ESTABLISHMENT_ID_COLUMN, "day_of_week"] }],
			}),
			true
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
		await queryRunner.dropTable(this.TABLE_NAME);
	}
}
