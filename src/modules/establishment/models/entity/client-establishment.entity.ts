import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { ClientRequestByEnum } from "@modules/establishment/models/enums/client-request-by.enum";
import { ClientRequestStatusEnum } from "@modules/establishment/models/enums/client-request-status.enum";
import { UserEntity } from "@modules/users/models/entity/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("client_establishments")
export class ClientEstablishmentEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "uuid", name: "user_id", nullable: true })
	public userId: string | null;

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: "user_id" })
	public user: UserEntity;

	@Column({ type: "uuid", name: "establishment_id", nullable: false })
	public establishmentId: string;

	@ManyToOne(() => EstablishmentEntity, establishment => establishment.clients)
	@JoinColumn({ name: "establishment_id" })
	public establishment: EstablishmentEntity;

	@Column({ name: "client_email", type: "varchar", nullable: false })
	public clientEmail: string;

	@Column({ type: "varchar", nullable: false, default: ClientRequestStatusEnum.PENDING })
	public status: ClientRequestStatusEnum;

	@Column({ type: "varchar", name: "requested_by", nullable: false })
	public requestedBy: ClientRequestByEnum;

	@Column({ type: "timestamp", name: "requested_at", nullable: false })
	public requestedAt: Date;

	@Column({ type: "timestamp", name: "approved_at", nullable: true })
	public approvedAt: Date;

	@Column({ type: "timestamp", name: "rejected_at", nullable: true })
	public rejectedAt: Date;

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;
}
