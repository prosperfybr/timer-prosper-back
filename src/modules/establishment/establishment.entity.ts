import { SegmentEntity } from "@modules/segment/segment.entity";
import { ServicesEntity } from "@modules/services/services.entity";
import { UserEntity } from "@modules/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("establishments")
export class EstablishmentEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "uuid", name: "user_id", nullable: false })
	public userId: string;

	@Column({ length: 150, name: "trade_name", nullable: false })
	public tradeName: string;

	@Column({ type: "varchar", nullable: true })
	public logo: string;

	@Column({ type: "varchar", name: "logo_dark", nullable: true })
	public logoDark: string;

	@Column({ length: 9, name: "zip_code", nullable: false })
	public zipCode: string;

	@Column({ length: 150, nullable: false })
	public street: string;

	@Column({ length: 20, nullable: false })
	public number: string;

	@Column({ length: 100, nullable: true })
	public complement: string;

	@Column({ length: 100, nullable: false })
	public neighborhood: string;

	@Column({ length: 100, nullable: false })
	public city: string;

	@Column({ length: 2, nullable: false })
	public state: string;

	@Column({ length: 20, name: "main_phone", nullable: false })
	public mainPhone: string;

	@Column({ type: "varchar", nullable: true })
	public website: string;

	@Column({ type: "varchar", nullable: true })
	public instagram: string;

	@Column({ type: "varchar", nullable: true })
	public linkedin: string;

	@Column({ type: "varchar", nullable: true })
	public tiktok: string;

	@Column({ type: "varchar", nullable: true })
	public youtube: string;

	@Column({ type: "varchar", nullable: true, length: 15 })
	public code: string;

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;

	@Column({ name: "segment_id", type: "uuid", nullable: false })
	public segmentId: string;

	@ManyToOne(() => SegmentEntity, segment => segment.establishments)
	@JoinColumn({ name: "segment_id" })
	public segment: SegmentEntity;

	@ManyToOne(() => UserEntity, user => user.establishments)
	@JoinColumn({ name: "user_id" })
	public user: UserEntity;

	@OneToMany(() => ServicesEntity, service => service.establishment)
	public services: ServicesEntity[];
}
