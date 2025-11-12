import { log } from "@config/Logger";

import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { Service } from "@shared/decorators/service.decorator";
import { CollaboratorRepository } from "../collaborator.repository";
import { FindEstablishmentService } from "@modules/establishment/services/find-establishment.service";
import { CollaboratorResponseDTO } from "../dto/collaborator-response.dto";
import { FindUserService } from "@modules/users/services/find-user.service";
import { UserResponseDTO } from "@modules/users/dto/user-response.dto";
import { CollaboratorEntity } from "../collaborator.entity";
import { EstablishmentResponseDTO } from "@modules/establishment/dto/establishment-response.dto";
import { CollaboratorServicesRepository } from "../collaborator-services.repository";
import { CollaboratorsServicesEntity } from "../collaborator-services.entity";
import { ServiceResponseDTO } from "@modules/services/dto/service-response.dto";
import { FindServiceService } from "@modules/services/services/find-service.service";

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
    if (!establishmentId) {
      log.error(`Establishment ID is required, but is received: [${establishmentId}]`);
      throw new InvalidArgumentException("O ID do estabelecimento é obrigatório");
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
