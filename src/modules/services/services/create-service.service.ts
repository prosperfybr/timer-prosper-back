import { log } from "@config/Logger";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";
import { ServiceTypeEntity } from "@modules/servicetype/models/entity/servicetype.entity";
import { ServiceTypeRepository } from "@modules/servicetype/repositories/servicetype.repository";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { ConverterUtils } from "@shared/utils/converter.utils";
import { CreateServiceDTO } from "../models/dto/create-service.dto";
import { ServiceResponseDTO } from "../models/dto/service-response.dto";
import { ServicesEntity } from "../models/entity/services.entity";
import { ServicesRepository } from "../repositories/services.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class CreateServiceService {
	constructor(
		private readonly converterUtils: ConverterUtils
	) {}

	@Track()
	public async execute(payload: CreateServiceDTO): Promise<ServiceResponseDTO> {
		log.info("Starting creation for a new service");

		const { name, description, price, duration, serviceTypeId, establishmentId } = payload;
		this.validateService(name, description, price);

		//const durationInMinutes: number = this.converterUtils.convertDurationInMinutes(duration);
		if (duration === 0) {
			log.error(`Service duration is invalid or in format invalid. [${duration}]`);
			throw new BadRequestException("O tempo de execução do serviço é inválido");
		}
		const serviceType: ServiceTypeEntity = await ServiceTypeRepository.findById(serviceTypeId);

		if (!serviceType) {
			log.error(`Service type not found with ID: [${serviceTypeId}]`);
			throw new BadRequestException("Tipo de serviço não encontrado com o ID informado");
		}

		const establishment: EstablishmentEntity = await EstablishmentRepository.findById(establishmentId);
		if (!establishment) {
			log.error(`Establishment not found with ID: [${establishmentId}]`);
			throw new BadRequestException("Estabelecimento não encontrado com o ID inforamdo");
		}

		// const priceInCents: number = this.converterUtils.convertFloatToCents(price);
		const newService: ServicesEntity = new ServicesEntity();
		newService.name = name;
		newService.description = description;
		newService.price = price;
		newService.duration = duration;
		newService.serviceTypeId = serviceType.id;
		newService.establishmentId = establishment.id;

		const serviceCreated: ServicesEntity = await ServicesRepository.save(newService);

		return {
			id: serviceCreated.id,
			name: serviceCreated.name,
			description: serviceCreated.description,
			price: this.converterUtils.convertCentsToFloat(serviceCreated.price),
			duration: serviceCreated.duration,
			durationFormated: this.converterUtils.convertMinutesInTime(serviceCreated.duration),
		} as ServiceResponseDTO;
	}

	private validateService(name: string, description: string, price: number): void {
		if (!name || name.trim().length <= 3) {
			log.error(`Service name is invalid. [${name}]`);
			throw new InvalidArgumentException("O nome do serviço é inválido");
		}

		if (description && description.trim().length < 5) {
			log.error(`Service description is invalid. [${description}]`);
			throw new InvalidArgumentException("A descrição do serviço é muito curta");
		}

		if (price <= 0) {
			log.error(`Service price is invalid. [${price}]`);
			throw new BadRequestException("O preço do serviço é inválido");
		}
	}
}
