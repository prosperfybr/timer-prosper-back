import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { ServiceTypeEntity } from "../models/entity/servicetype.entity";
import { ServiceTypeRepository } from "../repositories/servicetype.repository";

@Service()
export class DeleteServiceTypeService {
	constructor() {}

	public async delete(id: string): Promise<void> {
		if (!id) {
			log.error(`ID is required, but ID received is [${id}]`);
			throw new InvalidArgumentException("O ID do tipo de serviço é obrigatório");
		}

		const serviceType: ServiceTypeEntity = await ServiceTypeRepository.findById(id);

		if (!serviceType) {
			log.warn(`Service type is not deleted. Service type not found`);
			throw new BadRequestException("Tipo de serviço não encontrado");
		}

		if (serviceType.services.length > 0) {
			log.error(`It is not possible to delete a service type with associated services.`);
			throw new BadRequestException("Não é possível excluir este tipo de serviço pois tem serviços associado a este tipo.");
		}

		await ServiceTypeRepository.delete(id);
	}
}
