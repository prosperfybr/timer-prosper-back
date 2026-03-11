import { log } from "@config/Logger";
import { ServicesRepository } from "@modules/services/repositories/services.repository";
import { Service } from "@shared/decorators/service.decorator";
import { Track } from "@shared/decorators/logs/track.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { validate as validateUUID } from "uuid";
import { UpdatePromotionDTO } from "../models/dto/update-promotion.dto";
import { PromotionResponseDTO } from "../models/dto/promotion-response.dto";
import { PromotionsRepository } from "../repositories/promotions.repository";

@Service()
export class UpdatePromotionService {
	@Track()
	public async execute(id: string, payload: UpdatePromotionDTO): Promise<PromotionResponseDTO> {
		if (!validateUUID(id)) {
			throw new InvalidArgumentException("O ID da promoção deve ser um UUID válido");
		}

		const promotion = await PromotionsRepository.findById(id);
		if (!promotion) {
			throw new InvalidArgumentException("Promoção não encontrada");
		}

		const { serviceIds, startsAt, endsAt, ...rest } = payload;

		if (startsAt) promotion.startsAt = new Date(startsAt);
		if (endsAt) promotion.endsAt = new Date(endsAt);

		if (promotion.startsAt >= promotion.endsAt) {
			throw new InvalidArgumentException("A data de início deve ser anterior à data de término");
		}

		if (serviceIds && serviceIds.length > 0) {
			const services = await ServicesRepository.findByIds(serviceIds);
			if (services.length === 0) throw new InvalidArgumentException("Nenhum serviço válido encontrado");
			promotion.services = services;
		}

		Object.assign(promotion, rest);
		log.info(`Updating promotion ID: ${id}`);
		const saved = await PromotionsRepository.save(promotion);
		return saved as unknown as PromotionResponseDTO;
	}
}
