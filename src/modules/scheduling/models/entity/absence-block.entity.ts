import { CollaboratorEntity } from "@modules/collaborators/models/entity/collaborator.entity";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { ServicesEntity } from "@modules/services/models/entity/services.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * @description
 * Esta tabela tem por objetivo registrar bloqueios e exceções pontuais na agenda do colaborador
 * Por exemplo: Férias, consulta médica, almoço específico
 */
@Entity("absence_blocks")
export class AbsenceBlockEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "uuid", name: "collaborator_id", nullable: true })
	public collaboratorId: string;

	@ManyToOne(() => CollaboratorEntity)
	@JoinColumn({ name: "collaborator_id" })
	public collaborator: CollaboratorEntity;

	@Column({ type: "uuid", name: "service_id", nullable: true })
	public serviceId: string;

	@ManyToOne(() => ServicesEntity)
	@JoinColumn({ name: "service_id" })
	public service: ServicesEntity;

	@Column({ type: "uuid", name: "establishment_id", nullable: false})
	public establishmentId: string;

	@ManyToOne(() => EstablishmentEntity)
	@JoinColumn({ name: "establishment_id"})
	public establishment: EstablishmentEntity;

	@Column({ type: "varchar", name: "start_time", nullable: true })
	public startTime: string | null;

	@Column({ type: "varchar", name: "end_time", nullable: true })
	public endTime: string | null;

	@Column({ type: "varchar", name: "description", length: 255, nullable: true })
	public description: string | null;

	@Column({ type: "boolean", name: "is_recurrent", default: false, nullable: false })
	public isRecurrent: boolean;

	@Column({ type: "varchar", name: "recurrence_rule", nullable: true })
	public recurrenceRule: string | null;

	@Column({ type: "boolean", name: "is_active", default: true, nullable: false })
	public isActive: boolean;

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;
}
