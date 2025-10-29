import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class CreateRelations1761680619322 implements MigrationInterface {
	private readonly SEGMENTS_TABLE = "segments";
	private readonly USERS_TABLE = "users";
	private readonly ESTABLISHMENTS_TABLE = "establishments";
	private readonly SERVICE_TYPES_TABLE = "service_types";
	private readonly SEGMENT_FK_COLUMN = "segment_id";
	private readonly USER_FK_COLUMN = "user_id";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createForeignKey(
			this.ESTABLISHMENTS_TABLE,
			new TableForeignKey({
				columnNames: [this.USER_FK_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: this.USERS_TABLE,
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			})
		);

		await queryRunner.createForeignKey(
			this.ESTABLISHMENTS_TABLE,
			new TableForeignKey({
				columnNames: [this.SEGMENT_FK_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: this.SEGMENTS_TABLE,
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
			})
		);

		await queryRunner.createForeignKey(
			this.SERVICE_TYPES_TABLE,
			new TableForeignKey({
				columnNames: [this.SEGMENT_FK_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: this.SEGMENTS_TABLE,
				onDelete: "CASCADE",
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropForeignKey(
			this.SERVICE_TYPES_TABLE,
			new TableForeignKey({
				columnNames: [this.SEGMENT_FK_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: this.SEGMENTS_TABLE,
			})
		);

		await queryRunner.dropColumn(this.SERVICE_TYPES_TABLE, this.SEGMENT_FK_COLUMN);

		await queryRunner.dropForeignKey(
			this.ESTABLISHMENTS_TABLE,
			new TableForeignKey({
				columnNames: [this.SEGMENT_FK_COLUMN],
				referencedColumnNames: ["id"],
				referencedTableName: this.SEGMENTS_TABLE,
			})
		);

		await queryRunner.dropColumn(this.ESTABLISHMENTS_TABLE, this.SEGMENT_FK_COLUMN);

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

		const foreignKey = new TableForeignKey({
			columnNames: [this.SEGMENT_FK_COLUMN],
			referencedColumnNames: ["id"],
			referencedTableName: this.SEGMENTS_TABLE,
		});

		await queryRunner.dropForeignKey(this.SERVICE_TYPES_TABLE, foreignKey);
	}
}
