import { CollaboratorEntity } from "@modules/collaborators/models/entity/collaborator.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * @description
 * Esta tabela tem por objetivo registrar bloqueios e exceções pontuais na agenda do colaborador
 * Por exemplo: Férias, consulta médica, almoço específico
 */
@Entity("time_blocks")
export class TimeBlockEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "uuid", name: "collaborator_id", nullable: false })
	public collaboratorId: string;

	@ManyToOne(() => CollaboratorEntity)
	@JoinColumn({ name: "collaborator_id" })
	public collaborator: CollaboratorEntity;

	@Column({ type: "timestamp", name: "start_time", nullable: false })
	public startTime: Date;

	@Column({ type: "timestamp", name: "end_time", nullable: false })
	public endTime: Date;

	@Column({ type: "varchar", length: 150, nullable: true })
	public reason: string | null;

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;
}
