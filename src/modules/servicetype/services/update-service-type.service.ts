import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { ServiceTypeResponseDTO } from "../models/dto/service-type-response.dto";
import { UpdateServiceTypeDTO } from "../models/dto/update-service-type.dto";
import { ServiceTypeEntity } from "../models/entity/servicetype.entity";
import { ServiceTypeRepository } from "../repositories/servicetype.repository";

@Service()
export class UpdateServiceTypeService {
	constructor(private readonly serviceTypeRepository: ServiceTypeRepository, private readonly validatorUtils: ValidatorUtils) {}

	public async udpdate(payload: UpdateServiceTypeDTO): Promise<ServiceTypeResponseDTO> {
		const serviceType: ServiceTypeEntity = await this.serviceTypeRepository.findById(payload.id);

		if (!serviceType) {
			log.error(`Service type not found by id. ID [${payload.id}]`);
			throw new BadRequestException("Tipo de serviço não encontrado");
		}

		const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(serviceType, payload);

		if (Object.keys(fieldsToUpdate).length === 0) {
			log.warn(`Nothing to update for service type [${payload.name}]`);
			throw new BadRequestException("Não há nenhuma informação do tipo de serviço para atualizar");
		}

		await this.serviceTypeRepository.update(serviceType.id, fieldsToUpdate);
		return null;
	}
}
