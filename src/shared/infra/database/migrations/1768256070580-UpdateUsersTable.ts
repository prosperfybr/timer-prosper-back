import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateUsersTable1768256070580 implements MigrationInterface {
private readonly USER_TABLE = "users";
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns(
                    this.USER_TABLE,
                    [
                        new TableColumn({ name: "created_at", type: "timestamp", default: 'now' }),
                        new TableColumn({ name: "updated_at", type: "timestamp", isNullable: true }),
                    ]
                );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(this.USER_TABLE);
    }

}
