import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { Track } from "@shared/decorators/logs/track.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { validate as validateUUID } from "uuid";
import { PlansRepository } from "../repositories/plans.repository";

@Service()
export class DeletePlanService {
	@Track()
	public async execute(id: string): Promise<void> {
		if (!id || !validateUUID(id)) {
			throw new InvalidArgumentException("O ID do plano é obrigatório e deve ser um UUID válido");
		}

		const plan = await PlansRepository.findById(id);
		if (!plan) {
			throw new InvalidArgumentException("Plano não encontrado");
		}

		log.info(`Soft-deleting plan ID: ${id}`);
		plan.active = false;
		await PlansRepository.save(plan);
	}
}
