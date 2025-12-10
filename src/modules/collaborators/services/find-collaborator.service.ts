import { log } from "@config/Logger";

import { EstablishmentResponseDTO } from "@modules/establishment/models/dto/establishment/establishment-response.dto";
import { FindEstablishmentService } from "@modules/establishment/services/find-establishment.service";
import { ServiceResponseDTO } from "@modules/services/models/dto/service-response.dto";
import { FindServiceService } from "@modules/services/services/find-service.service";
import { UserResponseDTO } from "@modules/users/models/dto/user-response.dto";
import { FindUserService } from "@modules/users/services/find-user.service";
import { Service } from "@shared/decorators/service.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { validate as validateUUID } from "uuid";
import { CollaboratorResponseDTO } from "../models/dto/collaborator-response.dto";
import { CollaboratorsServicesEntity } from "../models/entity/collaborator-services.entity";
import { CollaboratorEntity } from "../models/entity/collaborator.entity";
import { CollaboratorServicesRepository } from "../repositories/collaborator-services.repository";
import { CollaboratorRepository } from "../repositories/collaborator.repository";

@Service()
export class FindCollaboratorService {
	constructor(
		//- Repositories
		private readonly collaboratorRepository: CollaboratorRepository,
		private readonly collaboratorServicesRepository: CollaboratorServicesRepository,
		//- Services
		private readonly findUserService: FindUserService,
		private readonly findEstablishmentService: FindEstablishmentService,
		private readonly findServiceService: FindServiceService
	) {}

	public async execute(id: string, establishmentCache?: EstablishmentResponseDTO): Promise<CollaboratorResponseDTO> {
		if (!id) {
			log.error(`Collaborator ID is required, but is received: [${id}]`);
			throw new InvalidArgumentException("O ID do colaborador é obrigatório");
		}

		const collaborator: CollaboratorEntity = await this.collaboratorRepository.findById(id);
		const user: UserResponseDTO = await this.findUserService.getUser(collaborator.userId);
		const establishment: EstablishmentResponseDTO = establishmentCache ? establishmentCache : await this.findEstablishmentService.findById(collaborator.establishmentId);
		const servicesEntities: CollaboratorsServicesEntity[] = await this.collaboratorServicesRepository.findAllServicesByCollaboratorId(collaborator.id);

		const servicesIds: string[] = servicesEntities.map(service => service.serviceId);
		const services: ServiceResponseDTO[] = await this.findServiceService.findServiceByIds(servicesIds);

		return this.treatResponse(collaborator, user, establishment, servicesIds, services);
	}

	public async getAllEstablishmentCollaborators(establishmentId: string): Promise<CollaboratorResponseDTO[]> {
		if (!establishmentId || !validateUUID(establishmentId)) {
			log.error(`Establishment ID is required and must be a valid UUID, but is received: [${establishmentId}]`);
			throw new InvalidArgumentException("O ID do estabelecimento é obrigatório e deve ser um UUID válido");
		}

		const establishment: EstablishmentResponseDTO = await this.findEstablishmentService.findById(establishmentId);
		const collaborators: CollaboratorEntity[] = await this.collaboratorRepository.findAllByEstablishmentId(establishment.id);
		const establishmentCollaborators: CollaboratorResponseDTO[] = [];

		if (!collaborators || collaborators.length === 0) {
			log.warn(`No collaborators found to this establishment`);
			return establishmentCollaborators;
		} else {
			for (const collaborator of collaborators) {
				establishmentCollaborators.push(await this.execute(collaborator.id, establishment));
			}

			return establishmentCollaborators;
		}
	}

	private treatResponse(
		collaborator: CollaboratorEntity,
		user: UserResponseDTO,
		establishment: EstablishmentResponseDTO,
		servicesIds: string[],
		services: ServiceResponseDTO[]
	): CollaboratorResponseDTO {
		return {
			id: collaborator.id,
			userId: user.id,
			user,
			establishmentId: establishment.id,
			establishment,
			servicesIds,
			services,
			collaboratorFunction: collaborator.collaboratorFunction,
			specialty: collaborator.specialty,
			hiringDate: collaborator.hiringDate,
			active: collaborator.active,
			createdAt: collaborator.createdAt,
			updatedAt: collaborator.updatedAt,
		} as CollaboratorResponseDTO;
	}
}
