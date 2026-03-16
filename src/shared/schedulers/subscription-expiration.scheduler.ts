import { log } from "@config/Logger";
import { AppDataSource } from "@config/ormconfig";
import { SubscriptionEntity } from "@modules/subscriptions/models/entity/subscription.entity";
import { SubscriptionStatusEnum } from "@modules/subscriptions/models/enum/subscription-status.enum";
import { EmailService, WebhookEmailType } from "@shared/utils/email-service.util";
import { PlanNameEnum } from "@modules/plans/models/enum/plan-name.enum";
import { LessThanOrEqual, Between } from "typeorm";

export const SubscriptionExpirationScheduler = {
	async handleExpirations() {
		log.info("⏱️ SCHEDULER ⏱️ Starting subscription expiration and notification process");
		
		try {
			const subscriptionRepo = AppDataSource.getRepository(SubscriptionEntity);
			const now = new Date();

			/* 1. ALERTA O USUÁRIO 3 DIAS ANTES DA EXPIRAÇÃO */
			const threeDaysFromNowStart = new Date();
			threeDaysFromNowStart.setHours(0, 0, 0, 0);
			threeDaysFromNowStart.setDate(now.getDate() + 3);
			
			const threeDaysFromNowEnd = new Date();
			threeDaysFromNowEnd.setHours(23, 59, 59, 999);
			threeDaysFromNowEnd.setDate(now.getDate() + 3);

			const warn3Days = await subscriptionRepo.find({
				where: {
					status: SubscriptionStatusEnum.ACTIVE,
					endDate: Between(threeDaysFromNowStart, threeDaysFromNowEnd),
					plan: { name: PlanNameEnum.FREE }
				},
				relations: ["establishment", "establishment.user", "plan"]
			});

			for (const sub of warn3Days) {
				log.info(`Enviando aviso de 3 dias para: ${sub.establishment.user.email}`);
				await EmailService.sendEmail(EmailService.buildEmailPayload(
					WebhookEmailType.PLANO_EXPIRANDO_3_DIAS,
					sub.establishment.tradeName,
					[sub.establishment.user.email],
					sub.establishment.user.name
				));
			}

			/* 2 ALERTA O USUÁRIO 1 DIA ANTES DA EXPIRAÇÃO */
			const oneDayFromNowStart = new Date();
			oneDayFromNowStart.setHours(0, 0, 0, 0);
			oneDayFromNowStart.setDate(now.getDate() + 1);
			
			const oneDayFromNowEnd = new Date();
			oneDayFromNowEnd.setHours(23, 59, 59, 999);
			oneDayFromNowEnd.setDate(now.getDate() + 1);

			const warn1Day = await subscriptionRepo.find({
				where: {
					status: SubscriptionStatusEnum.ACTIVE,
					endDate: Between(oneDayFromNowStart, oneDayFromNowEnd),
					plan: { name: PlanNameEnum.FREE }
				},
				relations: ["establishment", "establishment.user", "plan"]
			});

			for (const sub of warn1Day) {
				log.info(`Enviando aviso crítico de 1 dia para: ${sub.establishment.user.email}`);
				await EmailService.sendEmail(EmailService.buildEmailPayload(
					WebhookEmailType.PLANO_EXPIRANDO_ARVORE_1_DIA,
					sub.establishment.tradeName,
					[sub.establishment.user.email],
					sub.establishment.user.name
				));
			}

			/* 3. EXPIRA ASSINATURAS DE TESTES VENCIDAS */
			const expiredSubscriptions = await subscriptionRepo.find({
				where: {
					status: SubscriptionStatusEnum.ACTIVE,
					endDate: LessThanOrEqual(now),
					plan: { name: PlanNameEnum.FREE }
				},
				relations: ["establishment", "establishment.user", "plan"]
			});

			if (expiredSubscriptions.length > 0) {
				log.info(`Expirando ${expiredSubscriptions.length} assinaturas vinculadas ao plano FREE`);
				for (const sub of expiredSubscriptions) {
					sub.status = SubscriptionStatusEnum.EXPIRED;
					await subscriptionRepo.save(sub);
					
					log.info(`Notificando expiração para: ${sub.establishment.user.email}`);
					await EmailService.sendEmail(EmailService.buildEmailPayload(
						WebhookEmailType.PLANO_EXPIRADO,
						sub.establishment.tradeName,
						[sub.establishment.user.email],
						sub.establishment.user.name
					));
				}
			}

		} catch (error) {
			log.error("An error has occurred in SubscriptionExpirationScheduler: ", error);
		}
		
		log.info("⏱️ SCHEDULER ⏱️ Subscription verification finished");
	}
};
