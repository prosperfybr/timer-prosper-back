import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {ClientRequestStatusEnum} from "@modules/establishment/dto/client-request-status.enum";
import {ClientRequestByEnum} from "@modules/establishment/dto/client-request-by.enum";
import {UserEntity} from "@modules/users/user.entity";
import {EstablishmentEntity} from "@modules/establishment/establishment.entity";

@Entity("client_establishments")
export class ClientEstablishmentEntity {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ type: "uuid", name: "user_id", nullable: false })
    public userId: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: "user_id"})
    public user: UserEntity;

    @Column({ type: "uuid", name: "establishment_id", nullable: false })
    public establishmentId: string;

    @ManyToOne(() => EstablishmentEntity, establishment => establishment.clients)
    @JoinColumn({ name: "establishment_id"})
    public establishment: EstablishmentEntity;

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