import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { Track } from "@shared/decorators/logs/track.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { validate as validateUUID } from "uuid";
import { PlansRepository } from "../repositories/plans.repository";
import { PlanResponseDTO } from "../models/dto/plan-response.dto";

@Service()
export class FindPlanService {
	@Track()
	public async execute(id: string): Promise<PlanResponseDTO> {
		if (!id || !validateUUID(id)) {
			log.error(`Plan ID is required and must be a valid UUID, but received: [${id}]`);
			throw new InvalidArgumentException("O ID do plano é obrigatório e deve ser um UUID válido");
		}

		log.info(`Finding plan with ID: ${id}`);
		const plan = await PlansRepository.findById(id);

		if (!plan) {
			log.error(`Plan not found with ID: ${id}`);
			throw new InvalidArgumentException("Plano não encontrado");
		}

		return plan as PlanResponseDTO;
	}
}
