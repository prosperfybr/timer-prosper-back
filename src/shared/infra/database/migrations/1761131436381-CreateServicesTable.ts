import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateServicesTable1761131436381 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'services',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                        comment: 'Nome do serviço',
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                        comment: 'Descrição do serviço',
                    },
                    {
                        name: 'price',
                        type: 'integer',
                        isNullable: false,
                        comment: 'Preço salvo em centavos',
                    },
                    {
                        name: 'duration',
                        type: 'integer',
                        isNullable: false,
                        comment: 'Duração em minutos de execução do serviço',
                    },
                    {
                        name: 'service_type_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'establishment_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
        );

        await queryRunner.createForeignKey(
            'services',
            new TableForeignKey({
                columnNames: ['service_type_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'service_types',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'services',
            new TableForeignKey({
                columnNames: ['establishment_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'establishments',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table: Table = await queryRunner.getTable('services');

        if (table) {
            const serviceTypeForeignKey = table.foreignKeys.find(fk => fk.columnNames.includes('service_type_id'));
            if (serviceTypeForeignKey) await queryRunner.dropForeignKey('services', serviceTypeForeignKey);

            const establishmentForeignKey = table.foreignKeys.find(fk => fk.columnNames.includes('establishment_id'));
            if (establishmentForeignKey) await queryRunner.dropForeignKey('services', establishmentForeignKey);
        }

        await queryRunner.dropTable('services');
    }

}
