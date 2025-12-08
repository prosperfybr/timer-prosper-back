import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCollaboratorsUsersService1762898430613 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "collaborators_services",
				columns: [
					{
						name: "id",
						type: "uuid",
						isPrimary: true,
						default: "uuid_generate_v4()",
					},
					{
						name: "collaborator_id",
						type: "uuid",
						isUnique: false,
						isNullable: false,
					},
					{
						name: "service_id",
						type: "uuid",
						isUnique: false,
						isNullable: false,
					},
				],
			})
		);

		await queryRunner.createForeignKey(
			"collaborators_services",
			new TableForeignKey({
				columnNames: ["collaborator_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "collaborators",
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			})
		);

        await queryRunner.createForeignKey(
			"collaborators_services",
			new TableForeignKey({
				columnNames: ["service_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "services",
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
        const table: Table = await queryRunner.getTable('collaborators_services');

        if (table) {
            const serviceTypeForeignKey = table.foreignKeys.find(fk => fk.columnNames.includes('collaborator_id'));
            if (serviceTypeForeignKey) await queryRunner.dropForeignKey('collaborators_services', serviceTypeForeignKey);

            const establishmentForeignKey = table.foreignKeys.find(fk => fk.columnNames.includes('service_id'));
            if (establishmentForeignKey) await queryRunner.dropForeignKey('collaborators_services', establishmentForeignKey);
        }

        await queryRunner.dropTable('collaborators_services');
    }
}
