import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateEstablishmentTable1761840053818 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "establishments",
            new TableColumn({
                name: "code",
                type: "varchar",
                length: "15",
                isNullable: true,
                isUnique: true
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("establishments", "code");
    }

}
