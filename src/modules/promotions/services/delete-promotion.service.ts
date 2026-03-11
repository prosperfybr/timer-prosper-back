import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { Track } from "@shared/decorators/logs/track.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { validate as validateUUID } from "uuid";
import { PromotionsRepository } from "../repositories/promotions.repository";

@Service()
export class DeletePromotionService {
	@Track()
	public async execute(id: string): Promise<void> {
		if (!validateUUID(id)) {
			throw new InvalidArgumentException("O ID da promoção deve ser um UUID válido");
		}

		const promotion = await PromotionsRepository.findById(id);
		if (!promotion) {
			throw new InvalidArgumentException("Promoção não encontrada");
		}

		log.info(`Soft-deleting promotion ID: ${id}`);
		promotion.active = false;
		await PromotionsRepository.save(promotion);
	}
}
