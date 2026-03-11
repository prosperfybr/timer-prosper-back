import { log } from "@config/Logger";
import { ServicesRepository } from "@modules/services/repositories/services.repository";
import { Service } from "@shared/decorators/service.decorator";
import { Track } from "@shared/decorators/logs/track.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { validate as validateUUID } from "uuid";
import { CreatePromotionDTO } from "../models/dto/create-promotion.dto";
import { PromotionResponseDTO } from "../models/dto/promotion-response.dto";
import { PromotionsRepository } from "../repositories/promotions.repository";
import { PromotionsEntity } from "../models/entity/promotions.entity";

@Service()
export class CreatePromotionService {
	@Track()
	public async execute(payload: CreatePromotionDTO): Promise<PromotionResponseDTO> {
		const { establishmentId, serviceIds, startsAt, endsAt, ...rest } = payload;

		if (!validateUUID(establishmentId)) {
			throw new InvalidArgumentException("O ID do estabelecimento deve ser um UUID válido");
		}

		const starts = new Date(startsAt);
		const ends = new Date(endsAt);
		if (starts >= ends) {
			throw new InvalidArgumentException("A data de início deve ser anterior à data de término");
		}

		const services = await ServicesRepository.findByIds(serviceIds);
		if (services.length === 0) {
			throw new InvalidArgumentException("Nenhum serviço válido encontrado para a promoção");
		}

		const promotion = PromotionsRepository.create({
			...rest,
			establishmentId,
			startsAt: starts,
			endsAt: ends,
			services,
			active: true,
		} as Partial<PromotionsEntity>);

		const saved = await PromotionsRepository.save(promotion);
		log.info(`Promotion [${saved.title}] created for establishment ${establishmentId}`);
		return saved as unknown as PromotionResponseDTO;
	}
}
