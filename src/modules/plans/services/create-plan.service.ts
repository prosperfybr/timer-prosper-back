import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { Track } from "@shared/decorators/logs/track.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { PlansRepository } from "../repositories/plans.repository";
import { CreatePlanDTO } from "../models/dto/create-plan.dto";
import { PlanResponseDTO } from "../models/dto/plan-response.dto";
import { PlansEntity } from "../models/entity/plans.entity";

@Service()
export class CreatePlanService {
	@Track()
	public async execute(payload: CreatePlanDTO): Promise<PlanResponseDTO> {
		log.info(`Creating plan: ${payload.name}`);

		const existing = await PlansRepository.findOne({ where: { name: payload.name } });
		if (existing) {
			throw new InvalidArgumentException(`Já existe um plano com o nome '${payload.name}'`);
		}

		const plan = PlansRepository.create({
			name: payload.name,
			description: payload.description,
			monthlyPrice: payload.monthlyPrice,
			annualDiscount: payload.annualDiscount ?? 0.17,
			maxClients: payload.maxClients ?? null,
			hasAIScheduler: payload.hasAIScheduler ?? false,
			hasFeedbackCollector: payload.hasFeedbackCollector ?? false,
			hasCustomWebsite: payload.hasCustomWebsite ?? false,
			popular: payload.popular ?? false,
			features: payload.features ?? [],
			active: true,
		} as Partial<PlansEntity>);

		const saved = await PlansRepository.save(plan);
		log.info(`Plan [${saved.name}] created with ID: ${saved.id}`);
		return saved as PlanResponseDTO;
	}
}
