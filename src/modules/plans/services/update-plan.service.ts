import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { Track } from "@shared/decorators/logs/track.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { validate as validateUUID } from "uuid";
import { PlansRepository } from "../repositories/plans.repository";
import { UpdatePlanDTO } from "../models/dto/update-plan.dto";
import { PlanResponseDTO } from "../models/dto/plan-response.dto";

@Service()
export class UpdatePlanService {
	@Track()
	public async execute(id: string, payload: UpdatePlanDTO): Promise<PlanResponseDTO> {
		if (!id || !validateUUID(id)) {
			throw new InvalidArgumentException("O ID do plano é obrigatório e deve ser um UUID válido");
		}

		const plan = await PlansRepository.findById(id);
		if (!plan) {
			throw new InvalidArgumentException("Plano não encontrado");
		}

		log.info(`Updating plan ID: ${id}`);
		const updated = PlansRepository.merge(plan, payload as any);
		const saved = await PlansRepository.save(updated);
		return saved as PlanResponseDTO;
	}
}
