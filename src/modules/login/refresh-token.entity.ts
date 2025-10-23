import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { UserEntity } from "@modules/users/user.entity";

@Entity("refresh_tokens")
export class RefreshTokenEntity {
	@PrimaryGeneratedColumn("uuid")
	public id?: string;

	@Column({ name: "token_hash", type: "varchar", nullable: false, unique: true })
	public tokenHash: string;

	@Column({ name: "is_revoked", type: "boolean", default: false })
	public isRevoked: boolean;

	@Column({ name: "expires_at", type: "timestamp with time zone", nullable: false })
	public expiresAt: Date;

	@Column({ name: "client_ip", type: "varchar", nullable: true })
	public clientIp: string;

	@Column({ name: "user_agent", type: "varchar", nullable: true })
	public userAgent: string;

	@CreateDateColumn({ name: "created_at", type: "timestamp with time zone" })
	public createdAt: Date;

	@Column({ name: "user_id", type: "uuid", nullable: false })
	public userId: string;

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: "user_id" })
	public user?: UserEntity;
}
