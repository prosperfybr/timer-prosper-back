import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { Track } from "@shared/decorators/logs/track.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { validate as validateUUID } from "uuid";
import { PromotionResponseDTO } from "../models/dto/promotion-response.dto";
import { PromotionsRepository } from "../repositories/promotions.repository";

@Service()
export class FindPromotionsService {
	@Track()
	public async findAll(establishmentId: string): Promise<PromotionResponseDTO[]> {
		if (!validateUUID(establishmentId)) {
			throw new InvalidArgumentException("O ID do estabelecimento deve ser um UUID válido");
		}
		log.info(`Listing all promotions for establishment: ${establishmentId}`);
		const promotions = await PromotionsRepository.findByEstablishment(establishmentId);
		return promotions as unknown as PromotionResponseDTO[];
	}

	@Track()
	public async findActive(establishmentId: string): Promise<PromotionResponseDTO[]> {
		if (!validateUUID(establishmentId)) {
			throw new InvalidArgumentException("O ID do estabelecimento deve ser um UUID válido");
		}
		log.info(`Listing active promotions for establishment: ${establishmentId}`);
		const promotions = await PromotionsRepository.findActiveByEstablishment(establishmentId);
		return promotions as unknown as PromotionResponseDTO[];
	}
}
