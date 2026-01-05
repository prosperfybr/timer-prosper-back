import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { AbsenceBlockResponse } from "../models/dto/absence-block-response.dto";
import { AbsenceBlockRepository } from "../repositories/absence-block.repository";

@Service()
export class FindAbsenceBlockService {
	constructor(
		//- Mappers
		private readonly mapper: AbsenceBlockResponse,
	) {}

	public async find(establishmentId: string): Promise<AbsenceBlockResponse.DTO[]> {
		log.info("Finding all absences in establishment");

		if (!establishmentId) {
			log.error(`Establishment ID is required, but received [${establishmentId}]`);
			throw new InvalidArgumentException("ID do estabelecimento obrigatório");
		}

		const absences = await AbsenceBlockRepository.findAllByEstablishment(establishmentId);

		if (!absences || absences.length === 0) {
			log.info(`No absences registered yet to establishment [${establishmentId}]`);
			return [];
		}

		return await this.mapper.toDto(absences);
	}
}
