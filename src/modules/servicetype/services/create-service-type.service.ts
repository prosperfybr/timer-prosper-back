import { log } from "@config/Logger";
import { SegmentEntity } from "@modules/segment/models/entity/segment.entity";
import { SegmentRepository } from "@modules/segment/repositories/segment.repository";
import { Service } from "@shared/decorators/service.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { CreateServiceTypeDTO } from "../models/dto/create-service-type.dto";
import { ServiceTypeResponseDTO } from "../models/dto/service-type-response.dto";
import { ServiceTypeEntity } from "../models/entity/servicetype.entity";
import { ServiceTypeRepository } from "../repositories/servicetype.repository";

@Service()
export class CreateServiceTypeService {
	constructor(private readonly serviceTypeRepository: ServiceTypeRepository, private readonly segmentRepository: SegmentRepository) {}

	public async execute(payload: CreateServiceTypeDTO): Promise<ServiceTypeResponseDTO> {
		const { name, description, segmentId } = payload;

		if (!name || name.trim().length < 3) {
			log.error("Service type name is invalid. Must be contains at least 3 characters");
			throw new InvalidArgumentException("O nome do tipo de serviço é inválido");
		}

		if (description && description.trim().length < 5) {
			log.error("Service type description is invalid. Is too short");
			throw new InvalidArgumentException("A descrição do tipo de serviço é inválida");
		}

		const segment: SegmentEntity = await this.segmentRepository.findById(segmentId);
		if (!segment) {
			log.error(`Segment not found with ID [${segmentId}]`);
			throw new InvalidArgumentException("O ID do segmento é inválido");
		}

		const serviceType: ServiceTypeEntity = new ServiceTypeEntity();
		serviceType.name = name;
		serviceType.description = description;
		serviceType.segmentId = segment.id;

		const serviceTypeSaved: ServiceTypeEntity = await this.serviceTypeRepository.save(serviceType);

		return {
			id: serviceTypeSaved.id,
			name: serviceTypeSaved.name,
			description: serviceTypeSaved.description,
			segmentId: segment.id,
			segmentName: segment.name,
			services: null,
		} as ServiceTypeResponseDTO;
	}
}
