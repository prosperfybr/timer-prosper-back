import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SubscriptionEntity } from "@modules/subscriptions/models/entity/subscription.entity";
import { PaymentStatusEnum } from "../enum/payment-status.enum";

@Entity("payments")
export class PaymentEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "uuid", name: "subscription_id", nullable: false })
	public subscriptionId: string;

	@Column({ name: "external_transaction_id", nullable: true })
	public externalTransactionId: string | null;

	@Column({ type: "integer", nullable: false, comment: "Valor em centavos" })
	public amount: number;

	@Column({ type: "enum", enum: PaymentStatusEnum, default: PaymentStatusEnum.PENDING })
	public status: PaymentStatusEnum;

	@Column({ name: "payment_method", nullable: true })
	public paymentMethod: string | null;

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;

	@ManyToOne(() => SubscriptionEntity)
	@JoinColumn({ name: "subscription_id" })
	public subscription: SubscriptionEntity;
}
