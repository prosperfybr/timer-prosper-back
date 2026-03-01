import { log } from "@config/Logger";
import { ServiceResponseDTO } from "@modules/services/models/dto/service-response.dto";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { ConverterUtils } from "@shared/utils/converter.utils";
import { ServiceTypeResponseDTO } from "../models/dto/service-type-response.dto";
import { ServiceTypeEntity } from "../models/entity/servicetype.entity";
import { ServiceTypeRepository } from "../repositories/servicetype.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class FindServiceTypeService {
	constructor(private readonly converterUtils: ConverterUtils) {}

	@Track()
	public async findById(id: string): Promise<ServiceTypeResponseDTO> {
		log.info(`Starting search for a service type by id [${id}]`);

		if (!id) {
			log.error(`Service type ID is required, but ID is: [${id}]`);
			throw new InvalidArgumentException("O ID do tipo de serviço é inválido");
		}

		const serviceType: ServiceTypeEntity = await ServiceTypeRepository.findById(id);

		if (!serviceType) {
			log.error(`Service type is not found`);
			throw new BadRequestException("Tipo de serviço não encontrado");
		}

		return {
			id: serviceType.id,
			name: serviceType.name,
			description: serviceType.description,
			segmentId: serviceType.segment.id,
			segmentName: serviceType.segment.name,
			services: serviceType.services.map(
				(service) =>
					({
						id: service.id,
						name: service.name,
						description: service.description,
						price: this.converterUtils.convertCentsToFloat(service.price),
						duration: service.duration,
						durationFormated: this.converterUtils.convertMinutesInTime(service.duration),
					}) as ServiceResponseDTO,
			),
		} as ServiceTypeResponseDTO;
	}

	@Track()
	public async findByEstablishment(establishmentId: string): Promise<ServiceTypeResponseDTO[]> {
		log.info("Listing all service type by establishment");

		if (!establishmentId) {
			log.error(`EstablishmentId ID is required, but ID is [${establishmentId}]`);
			throw new InvalidArgumentException("O ID do estabelecimento é obrigatório");
		}

		const servicesType: ServiceTypeEntity[] = await ServiceTypeRepository.findByEstablishment(establishmentId);

		if (servicesType.length === 0) {
			log.error("The establishment does not yet have service types.");
			throw new BadRequestException("O estabelecimento ainda não tem tipos de serviço");
		}

		return servicesType.map(
			(serviceType) =>
				({
					id: serviceType.id,
					name: serviceType.name,
					description: serviceType.description,
					segmentId: serviceType.segment.id,
					segmentName: serviceType.segment.name,
				}) as ServiceTypeResponseDTO,
		);
	}

	@Track()
	public async findBySegment(segmentId: string): Promise<ServiceTypeResponseDTO[]> {
		log.info("Listing all service type by segment");

		if (!segmentId) {
			log.error(`SegmentId ID is required, but ID is [${segmentId}]`);
			throw new InvalidArgumentException("O ID do segmento é obrigatório");
		}

		const servicesType: ServiceTypeEntity[] = await ServiceTypeRepository.findBySegment(segmentId);

		if (servicesType.length === 0) {
			log.error("The segment does not yet have service types.");
			throw new BadRequestException("O segmento ainda não tem tipos de serviço");
		}

		return servicesType.map(
			(serviceType) =>
				({
					id: serviceType.id,
					name: serviceType.name,
					description: serviceType.description,
					segmentId: serviceType.segment.id,
					segmentName: serviceType.segment.name,
				}) as ServiceTypeResponseDTO,
		);
	}

	@Track()
	public async findAll(): Promise<ServiceTypeResponseDTO[]> {
		log.info(`Listing all services type`);
		const servicesType: ServiceTypeEntity[] = await ServiceTypeRepository.findAll();
		if (servicesType.length === 0) {
			log.error("Any service type founded yet");
			throw new BadRequestException("Sem tipos de serviços cadastrados");
		}

		return servicesType.map(
			(serviceType) =>
				({
					id: serviceType.id,
					name: serviceType.name,
					description: serviceType.description,
					segmentId: serviceType.segment.id,
					segmentName: serviceType.segment.name,
				}) as ServiceTypeResponseDTO,
		);
	}
}
