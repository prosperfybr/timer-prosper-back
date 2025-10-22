import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateEstablishmentTable1761131152868 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
await queryRunner.createTable(
            new Table({
                name: 'establishments',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'trade_name',
                        type: 'varchar',
                        length: '150',
                        isNullable: false,
                    },
                    {
                        name: 'logo',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'logo_dark',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'zip_code',
                        type: 'varchar',
                        length: '9',
                        isNullable: false,
                    },
                    {
                        name: 'street',
                        type: 'varchar',
                        length: '150',
                        isNullable: false,
                    },
                    {
                        name: 'number',
                        type: 'varchar',
                        length: '20',
                        isNullable: false,
                    },
                    {
                        name: 'complement',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'neighborhood',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'city',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'state',
                        type: 'varchar',
                        length: '2',
                        isNullable: false,
                    },
                    {
                        name: 'main_phone',
                        type: 'varchar',
                        length: '20',
                        isNullable: false,
                    },
                    {
                        name: 'website',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'instagram',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'linkedin',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'tiktok',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'youtube',
                        type: 'varchar',
                        isNullable: true,
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
            'establishments',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('establishments');
        const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('user_id') !== -1);

        if (foreignKey) await queryRunner.dropForeignKey('establishments', foreignKey);
        await queryRunner.dropTable('establishments');
    }

}
