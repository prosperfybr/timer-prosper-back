import { CollaboratorEntity } from "@modules/collaborators/collaborator.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("collaborator_availabilities")
export class CollaboratorAvailabilityEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "uuid", name: "collaborator_id", nullable: false })
	public collaboratorId: string;

	@ManyToOne(() => CollaboratorEntity)
	@JoinColumn({ name: "collaborator_id" })
	public collaborator: CollaboratorEntity;

	// De 1 (Segunda) a 7 (Domingo)
	@Column({ type: "int", name: "day_of_week", nullable: false })
	public dayOfWeek: number;

	@Column({ type: "time", name: "start_time", nullable: false })
	public startTime: string; // Ex: '09:00:00'

	@Column({ type: "time", name: "end_time", nullable: false })
	public endTime: string; // Ex: '12:00:00'

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;
}
