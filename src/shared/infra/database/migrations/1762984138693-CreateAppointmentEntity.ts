import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateAppointmentEntity1762984138693 implements MigrationInterface {
	private readonly TABLE_NAME = "appointments";
	private readonly COLLABORATOR_ID = "collaborator_id";
	private readonly CLIENT_ID = "client_id";
	private readonly SERVICE_ID = "service_id";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: this.TABLE_NAME,
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
					{ name: this.COLLABORATOR_ID, type: "uuid", isNullable: false },
					{ name: this.CLIENT_ID, type: "uuid", isNullable: false },
					{ name: this.SERVICE_ID, type: "uuid", isNullable: false },
					{ name: "start_time", type: "timestamp", isNullable: false },
					{ name: "end_time", type: "timestamp", isNullable: false },
					// Enum: pending, confirmed, completed, canceled
					{ name: "status", type: "varchar", length: "10", default: "'pending'", isNullable: false },
					{ name: "notes", type: "text", isNullable: true },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", default: "now()" },
				],
				indices: [{ columnNames: [this.COLLABORATOR_ID, "start_time", "end_time"] }],
			}),
			true,
		);

		// FK para Collaborator
		await queryRunner.createForeignKey(
			this.TABLE_NAME,
			new TableForeignKey({
				columnNames: [this.COLLABORATOR_ID],
				referencedColumnNames: ["id"],
				referencedTableName: "collaborators",
				onDelete: "RESTRICT", // Não permite deletar o colaborador se ele tiver agendamentos
			}),
		);

		// FK para Client
		await queryRunner.createForeignKey(
			this.TABLE_NAME,
			new TableForeignKey({
				columnNames: [this.CLIENT_ID],
				referencedColumnNames: ["id"],
				referencedTableName: "users",
				onDelete: "RESTRICT", // Não permite deletar o cliente se ele tiver agendamentos
			}),
		);

		// FK para Service
		await queryRunner.createForeignKey(
			this.TABLE_NAME,
			new TableForeignKey({
				columnNames: [this.SERVICE_ID],
				referencedColumnNames: ["id"],
				referencedTableName: "services", // Assumindo 'services' é o nome da tabela
				onDelete: "RESTRICT",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable(this.TABLE_NAME);
	}
}
