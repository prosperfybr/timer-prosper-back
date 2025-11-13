import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

import { ServicesEntity } from "@modules/services/services.entity";
import { CollaboratorEntity } from "@modules/collaborators/collaborator.entity";
import { UserEntity } from "@modules/users/user.entity";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "canceled";

@Entity("appointments")
export class AppointmentEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "uuid", name: "collaborator_id", nullable: false })
	public collaboratorId: string;
	@ManyToOne(() => CollaboratorEntity)
	@JoinColumn({ name: "collaborator_id" })
	public collaborator: CollaboratorEntity;

	@Column({ type: "uuid", name: "client_id", nullable: false })
	public clientId: string;
	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: "client_id" })
	public client: UserEntity;

	@Column({ type: "uuid", name: "service_id", nullable: false })
	public serviceId: string;
	@ManyToOne(() => ServicesEntity)
	@JoinColumn({ name: "service_id" })
	public service: ServicesEntity;

	@Column({ type: "timestamp", name: "start_time", nullable: false })
	public startTime: Date;

	@Column({ type: "timestamp", name: "end_time", nullable: false })
	public endTime: Date;

	@Column({ type: "enum", enum: ["pending", "confirmed", "completed", "canceled"], default: "pending", nullable: false })
	public status: AppointmentStatus;

	@Column({ type: "text", nullable: true })
	public notes: string | null;

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;
}
