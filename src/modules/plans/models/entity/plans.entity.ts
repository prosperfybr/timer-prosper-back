import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PlanNameEnum } from "../enum/plan-name.enum";

@Entity("plans")
export class PlansEntity {
	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ type: "enum", enum: PlanNameEnum, nullable: false, unique: true, comment: "Nome identificador do plano" })
	public name: PlanNameEnum;

	@Column({ type: "text", nullable: false, comment: "Descrição resumida do plano" })
	public description: string;

	@Column({ type: "integer", name: "monthly_price", nullable: false, comment: "Preço mensal em centavos" })
	public monthlyPrice: number;

	@Column({ type: "decimal", name: "annual_discount", precision: 5, scale: 4, nullable: false, default: 0.17, comment: "Desconto anual decimal ex: 0.17 = 17%" })
	public annualDiscount: number;

	@Column({ type: "integer", name: "max_clients", nullable: true, comment: "Máximo de clientes. null = ilimitado" })
	public maxClients: number | null;

	@Column({ type: "boolean", name: "has_ai_scheduler", default: false, comment: "Habilita o agendador de IA" })
	public hasAIScheduler: boolean;

	@Column({ type: "boolean", name: "has_feedback_collector", default: false, comment: "Habilita o coletor de feedback" })
	public hasFeedbackCollector: boolean;

	@Column({ type: "boolean", name: "has_custom_website", default: false, comment: "Habilita site personalizado" })
	public hasCustomWebsite: boolean;

	@Column({ type: "boolean", default: false, comment: "Marca o plano como 'Mais Popular'" })
	public popular: boolean;

	@Column({ type: "text", array: true, default: "'{}'" , comment: "Lista de benefícios do plano" })
	public features: string[];

	@Column({ type: "boolean", default: true, comment: "Plano ativo" })
	public active: boolean;

	@CreateDateColumn({ name: "created_at" })
	public createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt: Date;
}
