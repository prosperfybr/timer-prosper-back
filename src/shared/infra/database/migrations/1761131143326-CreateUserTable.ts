import { MigrationInterface, QueryRunner, Table } from "typeorm";

const userRoleEnum: string = 'user_role_enum';

export class CreateUserTable1761131143326 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE ${userRoleEnum} AS ENUM('admin', 'proprietario', 'colaborador', 'cliente');`);

        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                        comment: "Id do usuário"
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        isNullable: false,
                        comment: "Nome completo do usuário"
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        isUnique: true,
                        isNullable: false,
                        comment: "E-mail de acesso do usuário"
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                        isNullable: false,
                        comment: "Hash da senha do usuário"
                    },
                    {
                        name: 'role',
                        type: userRoleEnum,
                        isNullable: false,
                        default: "'cliente'",
                        comment: "Perfil do usuário na aplicação (os perfis possíveis são 'admin' | 'proprietario' | 'colaborador' | 'cliente')"
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
        await queryRunner.query(`DROP TYPE ${userRoleEnum};`);
    }
}
