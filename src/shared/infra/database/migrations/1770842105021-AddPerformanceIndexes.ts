import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPerformanceIndexes1770842105021 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Users
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

		// Establishments
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_establishments_user_id ON establishments(user_id)`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_establishments_code ON establishments(code)`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_establishments_segment_id ON establishments(segment_id)`);

		// Appointments
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_appointments_dates ON appointments(start_time, end_time)`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_appointments_collaborator ON appointments(collaborator_id, start_time)`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id, start_time)`);

		// Services
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_services_establishment ON services(establishment_id)`);

		// Collaborators
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_collaborators_establishment ON collaborators(establishment_id)`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);
		await queryRunner.query(`DROP INDEX IF EXISTS idx_establishments_user_id`);
		await queryRunner.query(`DROP INDEX IF EXISTS idx_establishments_code`);
		await queryRunner.query(`DROP INDEX IF EXISTS idx_establishments_segment_id`);
		await queryRunner.query(`DROP INDEX IF EXISTS idx_appointments_dates`);
		await queryRunner.query(`DROP INDEX IF EXISTS idx_appointments_collaborator`);
		await queryRunner.query(`DROP INDEX IF EXISTS idx_appointments_client`);
		await queryRunner.query(`DROP INDEX IF EXISTS idx_services_establishment`);
		await queryRunner.query(`DROP INDEX IF EXISTS idx_collaborators_establishment`);
	}
}
