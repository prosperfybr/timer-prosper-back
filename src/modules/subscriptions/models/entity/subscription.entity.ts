import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { PlansEntity } from "@modules/plans/models/entity/plans.entity";
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { BillingPeriodEnum } from "../enum/billing-period.enum";
import { SubscriptionStatusEnum } from "../enum/subscription-status.enum";

@Entity("subscriptions")
export class SubscriptionEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "uuid", name: "establishment_id", nullable: false })
	public establishmentId: string;

	@Column({ type: "uuid", name: "plan_id", nullable: false })
	public planId: string;

	@Column({ type: "enum", enum: BillingPeriodEnum, name: "billing_period", nullable: false })
	public billingPeriod: BillingPeriodEnum;

	@Column({ type: "enum", enum: SubscriptionStatusEnum, default: SubscriptionStatusEnum.ACTIVE })
	public status: SubscriptionStatusEnum;

	@Column({ type: "timestamp", name: "start_date" })
	public startDate: Date;

	@Column({ type: "timestamp", name: "end_date", nullable: true })
	public endDate: Date | null;

	@Column({ type: "timestamp", name: "next_billing_date", nullable: true })
	public nextBillingDate: Date | null;

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;

	@ManyToOne(() => EstablishmentEntity)
	@JoinColumn({ name: "establishment_id" })
	public establishment: EstablishmentEntity;

	@ManyToOne(() => PlansEntity)
	@JoinColumn({ name: "plan_id" })
	public plan: PlansEntity;
}
