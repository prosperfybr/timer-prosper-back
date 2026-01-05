import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { ServiceResponseDTO } from "../models/dto/service-response.dto";
import { UpdateServiceDTO } from "../models/dto/update-service.dto";
import { ServicesEntity } from "../models/entity/services.entity";
import { ServicesRepository } from "../repositories/services.repository";

@Service()
export class UpdateServiceService {
	constructor(private readonly validatorUtils: ValidatorUtils) {}

	public async execute(payload: UpdateServiceDTO): Promise<ServiceResponseDTO> {
		const service: ServicesEntity = await ServicesRepository.findById(payload.id);

		if (!service) {
			log.error(`Service not found with id. ID [${payload.id}]`);
			throw new BadRequestException("Serviço não encontrado");
		}

		const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(service, payload);

		if (Object.keys(fieldsToUpdate).length === 0) {
			log.warn(`Nothing to udpate for service [${payload.name}]`);
			throw new BadRequestException("Não há nenhuma informação do serviço para atualizar");
		}

		await ServicesRepository.update(service.id, fieldsToUpdate);
		return null;
	}
}
