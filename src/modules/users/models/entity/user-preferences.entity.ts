import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("user_preferences")
export class UserPreferencesEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "uuid", name: "user_id", nullable: false, unique: true })
	public userId: string;

	@OneToOne(() => UserEntity, user => user.preferences, { onDelete: "CASCADE" })
	@JoinColumn({ name: "user_id" })
	public user: UserEntity;

	@Column({ type: "boolean", name: "dark_mode", default: false, nullable: false })
	public darkMode: boolean;

	@Column({ type: "boolean", name: "email_notifications", default: true, nullable: false })
	public emailNotifications: boolean;

	@Column({ type: "boolean", name: "whatsapp_notifications", default: true, nullable: false })
	public whatsappNotifications: boolean;

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;
}
