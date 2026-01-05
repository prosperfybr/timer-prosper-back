import { log } from "@config/Logger";
import { SegmentResponseDTO } from "@modules/segment/models/dto/segment-response.dto";
import { SegmentEntity } from "@modules/segment/models/entity/segment.entity";
import { ServiceResponseDTO } from "@modules/services/models/dto/service-response.dto";
import { ServicesEntity } from "@modules/services/models/entity/services.entity";
import { UserResponseDTO } from "@modules/users/models/dto/user-response.dto";
import { UserEntity } from "@modules/users/models/entity/user.entity";
import { UserRepository } from "@modules/users/repositories/users.repository";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { validate as validateUUID } from "uuid";
import { ConverterUtils } from "@shared/utils/converter.utils";
import { EstablishmentResponseDTO } from "@modules/establishment/models/dto/establishment/establishment-response.dto";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";

@Service()
export class FindEstablishmentService {
	constructor(private readonly converterUtils: ConverterUtils) {}

	public async findById(id: string): Promise<EstablishmentResponseDTO> {
		if (!id || !validateUUID(id)) {
			log.error(`ID is required and must be a valid UUID, but ID value is [${id}]`);
			throw new InvalidArgumentException("O ID do estabelecimento é obrigatório e deve ser um UUID válido");
		}

		const establishment: EstablishmentEntity = await EstablishmentRepository.findById(id);

		if (!establishment) {
			log.error(`Establishment not founded by id`);
			throw new BadRequestException("Estabelecimento não encontrado");
		}

		return this.treatData(establishment);
	}

	public async findAll(): Promise<EstablishmentResponseDTO[]> {
		const establishments: EstablishmentEntity[] = await EstablishmentRepository.find();
		return establishments.length > 0 ? establishments.map(this.treatData) : [];
	}

	public async findAllByUser(userId: string): Promise<EstablishmentResponseDTO[]> {
		if (!userId) {
			log.error(`Owner ID is invalid`);
			throw new InvalidArgumentException("O ID do proprietário é inválido");
		}

		const establishments: EstablishmentEntity[] = await UserRepository.findUserEstablishments(userId);
		return establishments.length > 0 ? establishments.map(this.treatData) : [];
	}

	public async filterEstablishmentByIdentifier(identifier: string): Promise<EstablishmentResponseDTO[]> {
		if (!identifier) {
			log.warn(`Any identifier is received. [${identifier}]`);
			return [];
		}

		const establishments: EstablishmentEntity[] = await EstablishmentRepository.findAllByIdentifier(identifier);
		return establishments.map(this.treatData);
	}

	private treatData(establishment: EstablishmentEntity): EstablishmentResponseDTO {
		const user: UserEntity = establishment.user ? establishment.user : null;
		const services: ServicesEntity[] = establishment.services ? establishment.services : null;
		const estabSegment: SegmentEntity = establishment.segment ? establishment.segment : null;

		return {
			id: establishment.id,
			userId: establishment.userId,
			segmentId: establishment.segmentId,
			code: establishment.code,
			tradeName: establishment.tradeName,
			logo: establishment.logo,
			logoDark: establishment.logoDark,
			zipCode: establishment.zipCode,
			street: establishment.street,
			number: establishment.number,
			complement: establishment.complement,
			neighborhood: establishment.neighborhood,
			city: establishment.city,
			state: establishment.state,
			mainPhone: establishment.mainPhone,
			website: establishment.website,
			instagram: establishment.instagram,
			linkedin: establishment.linkedin,
			tiktok: establishment.tiktok,
			youtube: establishment.youtube,
			createdAt: establishment.createdAt,
			updatedAt: establishment.updatedAt,
			user: user
				? ({
						id: user.id,
						name: user.email,
						email: user.email,
						role: user.role,
				  } as UserResponseDTO)
				: null,
			services: services
				? services.map(
						service =>
							({
								id: service.id,
								name: service.name,
								description: service.description,
								price: this.converterUtils.convertCentsToFloat(service.price),
								duration: service.duration,
								durationFormated: this.converterUtils.convertMinutesInTime(service.duration),
							} as ServiceResponseDTO)
				  )
				: null,
			segment: estabSegment
				? ({
						id: estabSegment.id,
						name: estabSegment.name,
						active: estabSegment.isActive,
				  } as SegmentResponseDTO)
				: null,
		} as EstablishmentResponseDTO;
	}
}