import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { Track } from "@shared/decorators/logs/track.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { AppDataSource } from "@config/ormconfig";
import { PlansRepository } from "@modules/plans/repositories/plans.repository";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";
import { UserRepository } from "@modules/users/repositories/users.repository";
import { SubscriptionEntity } from "../models/entity/subscription.entity";
import { PaymentEntity } from "@modules/payments/models/entity/payment.entity";
import { CreateSubscriptionDTO } from "../models/dto/create-subscription.dto";
import { BillingPeriodEnum } from "../models/enum/billing-period.enum";
import { SubscriptionStatusEnum } from "../models/enum/subscription-status.enum";
import { PaymentStatusEnum } from "@modules/payments/models/enum/payment-status.enum";
import { GenericPaymentProvider } from "@modules/payments/providers/implementations/generic-payment.provider";
import { PlanNameEnum } from "@modules/plans/models/enum/plan-name.enum";

@Service()
export class CreateSubscriptionService {
	private readonly paymentProvider: GenericPaymentProvider;

	constructor() {
		this.paymentProvider = new GenericPaymentProvider();
	}

	@Track()
	public async execute(payload: CreateSubscriptionDTO): Promise<SubscriptionEntity> {
		log.info(`Iniciando assinatura para o estabelecimento: ${payload.establishmentId}`);

		const establishment = await EstablishmentRepository.findOne({ 
			where: { id: payload.establishmentId },
			relations: ["user"]
		});
		
		if (!establishment) throw new InvalidArgumentException("Estabelecimento não encontrado");

		const plan = await PlansRepository.findById(payload.planId);
		if (!plan) throw new InvalidArgumentException("Plano não encontrado");

		// 1. Trava de Reativação para Plano Gratuito
		if (plan.name === PlanNameEnum.FREE) {
			const hasUsedFreePlan = await AppDataSource.getRepository(SubscriptionEntity).findOne({
				where: { 
					establishmentId: payload.establishmentId,
					plan: { name: PlanNameEnum.FREE }
				},
				relations: ["plan"]
			});

			if (hasUsedFreePlan) {
				throw new InvalidArgumentException(
					"Você já utilizou o período de teste gratuito. Por favor, renove sua assinatura em um dos planos pagos para continuar usufruindo da plataforma."
				);
			}
		}

		// Calcular valor
		let amount = plan.monthlyPrice;
		if (payload.billingPeriod === BillingPeriodEnum.ANNUAL) {
			amount = Math.round(plan.monthlyPrice * 12 * (1 - plan.annualDiscount));
		}

		// 2. Processar pagamento apenas se o preço for maior que zero
		let paymentResult = { transactionId: "FREE_PLAN", status: "PAID" };

		if (plan.monthlyPrice > 0) {
			paymentResult = await this.paymentProvider.processPayment({
				amount,
				currency: "BRL",
				customer: {
					name: payload.customer?.name || establishment.user.name,
					email: payload.customer?.email || establishment.user.email,
					document: payload.customer?.document,
				},
				paymentMethod: payload.paymentMethod,
			});

			if (paymentResult.status !== "PAID") {
				throw new InvalidArgumentException("Pagamento não autorizado pelo gateway");
			}
		}

		// Transação para salvar assinatura e pagamento
		return await AppDataSource.transaction(async (manager) => {
			const now = new Date();
			let nextBilling: Date | null = new Date();
			let endDate: Date | null = null;

			if (plan.name === PlanNameEnum.FREE) {
				endDate = new Date();
				endDate.setDate(now.getDate() + 14);
				nextBilling = null;
			} else {
				if (payload.billingPeriod === BillingPeriodEnum.MONTHLY) {
					nextBilling.setMonth(now.getMonth() + 1);
				} else {
					nextBilling.setFullYear(now.getFullYear() + 1);
				}
			}

			const subscription = manager.create(SubscriptionEntity, {
				establishmentId: payload.establishmentId,
				planId: payload.planId,
				billingPeriod: payload.billingPeriod,
				status: SubscriptionStatusEnum.ACTIVE,
				startDate: now,
				endDate,
				nextBillingDate: nextBilling,
			});

			const savedSubscription = await manager.save(subscription);

			const payment = manager.create(PaymentEntity, {
				subscriptionId: savedSubscription.id,
				externalTransactionId: paymentResult.transactionId,
				amount,
				status: PaymentStatusEnum.PAID,
				paymentMethod: payload.paymentMethod.type,
			});

			await manager.save(payment);

			log.info(`Assinatura [${savedSubscription.id}] criada com sucesso para plano ${plan.name}`);
			return savedSubscription;
		});
	}
}
