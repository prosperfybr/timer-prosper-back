import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EstablishmentEntity } from "./establishment.entity";

@Entity("establishment_hours")
export class EstablishmentHourEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "uuid", name: "establishment_id", nullable: false })
	public establishmentId: string;

	@ManyToOne(() => EstablishmentEntity, establishment => establishment.hours)
	@JoinColumn({ name: "establishment_id" })
	public establishment: EstablishmentEntity;

	@Column({ type: "int", name: "day_of_week", nullable: false })
	public dayOfWeek: number;

	@Column({ type: "time", name: "opening_time", nullable: false })
	public openingTime: string; //- Example: 08:00:00

	@Column({ type: "time", name: "closing_time", nullable: false })
	public closingTime: string; //- Example: 20:00:00

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;
}
