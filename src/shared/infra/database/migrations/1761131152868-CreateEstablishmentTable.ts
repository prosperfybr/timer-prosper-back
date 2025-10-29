import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateEstablishmentTable1761131152868 implements MigrationInterface {
	private readonly ESTABLISHMENTS_TABLE = "establishments";
	private readonly USERS_TABLE = "users";
	private readonly SEGMENTS_TABLE = "segments";
	private readonly USER_FK_COLUMN = "user_id";
	private readonly SEGMENT_FK_COLUMN = "segment_id";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: this.ESTABLISHMENTS_TABLE,
				columns: [
					{
						name: "id",
						type: "uuid",
						isPrimary: true,
						default: "uuid_generate_v4()",
					},
					{
						name: this.USER_FK_COLUMN,
						type: "uuid",
						isNullable: false,
					},
					{
						name: "trade_name",
						type: "varchar",
						length: "150",
						isNullable: false,
					},
					{
						name: "logo",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "logo_dark",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "zip_code",
						type: "varchar",
						length: "9",
						isNullable: false,
					},
					{
						name: "street",
						type: "varchar",
						length: "150",
						isNullable: false,
					},
					{
						name: "number",
						type: "varchar",
						length: "20",
						isNullable: false,
					},
					{
						name: "complement",
						type: "varchar",
						length: "100",
						isNullable: true,
					},
					{
						name: "neighborhood",
						type: "varchar",
						length: "100",
						isNullable: false,
					},
					{
						name: "city",
						type: "varchar",
						length: "100",
						isNullable: false,
					},
					{
						name: "state",
						type: "varchar",
						length: "2",
						isNullable: false,
					},
					{
						name: "main_phone",
						type: "varchar",
						length: "20",
						isNullable: false,
					},
					{
						name: "website",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "instagram",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "linkedin",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "tiktok",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "youtube",
						type: "varchar",
						isNullable: true,
					},
					{
						name: this.SEGMENT_FK_COLUMN,
						type: "uuid",
						isNullable: true,
					},
					{
						name: "created_at",
						type: "timestamp",
						default: "now()",
					},
					{
						name: "updated_at",
						type: "timestamp",
						default: "now()",
					},
				],
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const userForeignKey = new TableForeignKey({
			columnNames: [this.USER_FK_COLUMN],
			referencedColumnNames: ["id"],
			referencedTableName: this.USERS_TABLE,
		});

		const segmentForeignKey = new TableForeignKey({
			columnNames: [this.SEGMENT_FK_COLUMN],
			referencedColumnNames: ["id"],
			referencedTableName: this.SEGMENTS_TABLE,
		});

		await queryRunner.dropForeignKey(this.ESTABLISHMENTS_TABLE, segmentForeignKey);
		await queryRunner.dropForeignKey(this.ESTABLISHMENTS_TABLE, userForeignKey);
		await queryRunner.dropTable(this.ESTABLISHMENTS_TABLE);
	}
}
