import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { EstablishmentHourEntity } from "../models/entity/establishment-hour.entity";
import { EstablishmentHourRepository } from "../repositories/establishment-hour.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class DeleteEstablishmentHourService {
	constructor() {}

	@Track()
	public async execute(id: string): Promise<void> {
		if (!id) {
			log.error(`Establishment Hour id is requred, but received [${id}]`);
			throw new InvalidArgumentException("O ID do horário do estabelecimento é obrigatório");
		}

		const hour: EstablishmentHourEntity = await EstablishmentHourRepository.findById(id);
		if (!hour) {
			log.error(`Establishment hour not found by id. ID [${id}]`);
			throw new BadRequestException("O horário do estabelecimento não foi encontrado com o ID informado");
		}

		await EstablishmentHourRepository.delete(hour.id);
	}
}
