import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class CreateSegmentTable1761131152865 implements MigrationInterface {
	private readonly SEGMENTS_TABLE = "segments";
	private readonly ESTABLISHMENTS_TABLE = "establishments";
	private readonly SERVICE_TYPES_TABLE = "service_types";
	private readonly SEGMENT_FK_COLUMN = "segment_id";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: this.SEGMENTS_TABLE,
				columns: [
					{
						name: "id",
						type: "uuid",
						isPrimary: true,
						isNullable: false,
						default: "uuid_generate_v4()",
					},
					{
						name: "name",
						type: "varchar",
						length: "100",
						isNullable: false,
						isUnique: true,
					},
					{
						name: "is_active",
						type: "boolean",
						isNullable: false,
						default: true,
					},
					{
						name: "created_at",
						type: "timestamp",
						default: "now()",
					},
					{
						name: "updated_at",
						type: "timestamp",
						isNullable: true
					},
				],
			}),
			true
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable(this.SEGMENTS_TABLE);
	}
}
