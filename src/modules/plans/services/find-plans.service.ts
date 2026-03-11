import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { Track } from "@shared/decorators/logs/track.decorator";
import { PlansRepository } from "../repositories/plans.repository";
import { PlanResponseDTO } from "../models/dto/plan-response.dto";

@Service()
export class FindPlansService {
	@Track()
	public async execute(): Promise<PlanResponseDTO[]> {
		log.info("Finding all active plans");
		const plans = await PlansRepository.findAll();
		return plans as PlanResponseDTO[];
	}
}
