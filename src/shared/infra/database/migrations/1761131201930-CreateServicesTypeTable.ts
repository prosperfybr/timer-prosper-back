import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateServicesTypeTable1761131201930 implements MigrationInterface {

    private readonly SERVICE_TYPES_TABLE = 'service_types';
    private readonly SEGMENTS_TABLE = 'segments';
    private readonly SEGMENT_FK_COLUMN = 'segment_id';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: this.SERVICE_TYPES_TABLE,
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
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: this.SEGMENT_FK_COLUMN,
                        type: 'uuid',
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(this.SERVICE_TYPES_TABLE);
    }
}
