import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { ServicesEntity } from "@modules/services/models/entity/services.entity";
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { DiscountTypeEnum } from "../enum/discount-type.enum";

@Entity("promotions")
export class PromotionsEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "uuid", name: "establishment_id", nullable: false })
	public establishmentId: string;

	@Column({ length: 150, nullable: false, comment: "Título da promoção, ex: Semana do Consumidor" })
	public title: string;

	@Column({ type: "text", nullable: true, comment: "Descrição detalhada da promoção" })
	public description: string;

	@Column({ type: "enum", enum: DiscountTypeEnum, name: "discount_type", nullable: false, comment: "PERCENTAGE ou FIXED" })
	public discountType: DiscountTypeEnum;

	@Column({ type: "integer", name: "discount_value", nullable: false, comment: "Valor do desconto: % inteiro (20) ou centavos (1000)" })
	public discountValue: number;

	@Column({ type: "timestamp", name: "starts_at", nullable: false, comment: "Início da promoção" })
	public startsAt: Date;

	@Column({ type: "timestamp", name: "ends_at", nullable: false, comment: "Fim da promoção" })
	public endsAt: Date;

	@Column({ type: "boolean", default: true })
	public active: boolean;

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;

	@ManyToOne(() => EstablishmentEntity)
	@JoinColumn({ name: "establishment_id" })
	public establishment: EstablishmentEntity;

	@ManyToMany(() => ServicesEntity)
	@JoinTable({
		name: "promotion_services",
		joinColumn: { name: "promotion_id", referencedColumnName: "id" },
		inverseJoinColumn: { name: "service_id", referencedColumnName: "id" },
	})
	public services: ServicesEntity[];
}
