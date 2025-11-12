import { Service } from "@shared/decorators/service.decorator";
import { EstablishmentRepository } from "../establishment.repository";
import { EstablishmentResponseDTO } from "../dto/establishment-response.dto";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { log } from "@config/Logger";
import { EstablishmentEntity } from "../establishment.entity";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { UserEntity } from "@modules/users/user.entity";
import { ServicesEntity } from "@modules/services/services.entity";
import { UserResponseDTO } from "@modules/users/dto/user-response.dto";
import { ConverterUtils } from "@shared/utils/converter.utils";
import { ServiceResponseDTO } from "@modules/services/dto/service-response.dto";
import { UserRepository } from "@modules/users/users.repository";
import { SegmentEntity } from "@modules/segment/segment.entity";
import { SegmentResponseDTO } from "@modules/segment/dto/segment-response.dto";

@Service()
export class FindEstablishmentService {
	constructor(
    //- Repositories
    private readonly establishmentRepository: EstablishmentRepository,
    private readonly userRepository: UserRepository,
    //- Utils
    private readonly converterUtils: ConverterUtils) {}

	public async findById(id: string): Promise<EstablishmentResponseDTO> {
		if (!id) {
			log.error(`ID is required, but ID value is [${id}]`);
			throw new InvalidArgumentException("O ID do estabelecimento é obrigatório");
		}

		const establishment: EstablishmentEntity = await this.establishmentRepository.findById(id);

		if (!establishment) {
			log.error(`Establishment not founded by id`);
			throw new BadRequestException("Estabelecimento não encontrado");
		}

		return this.treatData(establishment);
	}

	public async findAll(): Promise<EstablishmentResponseDTO[]> {
		const establishments: EstablishmentEntity[] = await this.establishmentRepository.findAll();
		return establishments.length > 0 ? establishments.map(this.treatData) : [];
	}

	public async findAllByUser(userId: string): Promise<EstablishmentResponseDTO[]> {
		if (!userId) {
		  log.error(`Owner ID is invalid`);
		  throw new InvalidArgumentException("O ID do proprietário é inválido");
		}

		const establishments: EstablishmentEntity[] = await this.userRepository.findUserEstablishments(userId)
		return establishments.length > 0 ? establishments.map(this.treatData) : [];
	}

	public async filterEstablishmentByIdentifier(identifier: string): Promise<EstablishmentResponseDTO[]> {
		if (!identifier) {
			log.warn(`Any identifier is received. [${identifier}]`);
			return [];
		}

		const establishments: EstablishmentEntity[] = await this.establishmentRepository.findAllByIdentifier(identifier);
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
			user: user ? {
				id: user.id,
				name: user.email,
				email: user.email,
				role: user.role,
			} as UserResponseDTO : null,
			services: services ? services.map(
				service =>
					({
						id: service.id,
						name: service.name,
						description: service.description,
						price: this.converterUtils.convertCentsToFloat(service.price),
						duration: service.duration,
						durationFormated: this.converterUtils.convertMinutesInTime(service.duration),
					} as ServiceResponseDTO)
			) : null,
			segment: estabSegment ? {
				id: estabSegment.id,
				name: estabSegment.name,
				active: estabSegment.isActive
			} as SegmentResponseDTO : null
		} as EstablishmentResponseDTO;
	}
}
