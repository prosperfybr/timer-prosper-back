import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { DeleteResult } from "typeorm";
import { EstablishmentRepository } from "../repositories/establishment.repository";

@Service()
export class DeleteEstablishmentService {
	constructor(private readonly establishmentRepository: EstablishmentRepository) {}

	public async delete(id: string): Promise<void> {
		if (!id) {
			log.error(`Establishment ID is required, but the value received is [${id}]`);
			throw new InvalidArgumentException("O ID do estabelecimento é inválido");
		}

		const result: DeleteResult = await this.establishmentRepository.delete(id);

		if (result.affected && result.affected == 0) {
			log.warn(`Establishment is not deleted. Service type not found`);
			throw new BadRequestException("Estabelecimento não encontrado");
		}
	}
}
