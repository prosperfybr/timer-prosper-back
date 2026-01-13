import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ConverterUtils } from "@shared/utils/converter.utils";
import { In } from "typeorm";
import { ServiceResponseDTO } from "../models/dto/service-response.dto";
import { PaginatedResult, ServiceRequestFilter } from "../models/dto/services-request-filter.dto";
import { ServicesEntity } from "../models/entity/services.entity";
import { ServicesRepository } from "../repositories/services.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class FindServiceService {
	private DEFAULT_LIMIT: number = 10;

	constructor(private readonly converterUtils: ConverterUtils) {}

	@Track()
	public async findServiceById(id: string): Promise<ServiceResponseDTO> {
		log.info(`Finding a service with ID [${id}]`);

		if (!id) {
			log.error("ID is invalid");
			throw new BadRequestException("O ID do serviço é obrigatório");
		}

		const service: ServicesEntity = await ServicesRepository.findById(id);

		if (!service) {
			log.error("Service not found");
			throw new BadRequestException("Serviço não encontrado");
		}

		return {
			id: service.id,
			name: service.name,
			description: service.description,
			price: this.converterUtils.convertCentsToFloat(service.price),
			duration: service.duration,
			durationFormated: this.converterUtils.convertMinutesInTime(service.duration),
		} as ServiceResponseDTO;
	}

	@Track()
	public async findServiceByIds(ids: string[]): Promise<ServiceResponseDTO[]> {
		log.info(`Finding a service with ID [${ids}]`);

		if (!ids || ids.length === 0) {
			log.error("ID is invalid");
			throw new BadRequestException("O ID dos serviços são obrigatórios");
		}

		const services: ServicesEntity[] = await ServicesRepository.find({ where: { id: In(ids) } });

		if (!services || services.length === 0) {
			log.error("Services not found");
			return [];
		}

		return services.map(
			(service) =>
				({
					id: service.id,
					name: service.name,
					description: service.description,
					price: this.converterUtils.convertCentsToFloat(service.price),
					duration: service.duration,
					durationFormated: this.converterUtils.convertMinutesInTime(service.duration),
				}) as ServiceResponseDTO,
		);
	}

	@Track()
	public async findService(filter: ServiceRequestFilter): Promise<PaginatedResult<ServicesEntity>> {
		const limit: number = parseInt(filter.limit || `${this.DEFAULT_LIMIT}`, 10);
		const page: number = parseInt(filter.page || "1", 10);
		const currentPage: number = Math.max(1, page);
		const skip: number = (currentPage - 1) * limit;
		const whereClause: any = {};

		if (filter.establishmentId) whereClause.establishmentId = filter.establishmentId;
		if (filter.serviceTypeId) whereClause.serviceTypeId = filter.establishmentId;

		const [services, totalItems] = await ServicesRepository.findAndCount({
			where: whereClause,
			take: limit,
			skip,
			relations: ["establishment", "serviceType"],
			order: { name: "ASC" },
		});

		const totalPages: number = Math.ceil(totalItems / limit);
		const result: PaginatedResult<ServicesEntity> = {
			data: services,
			meta: {
				totalItems,
				itemCount: services.length,
				itemsPerPage: limit,
				totalPages,
				currentPage,
			},
		};

		return result;
	}
}
