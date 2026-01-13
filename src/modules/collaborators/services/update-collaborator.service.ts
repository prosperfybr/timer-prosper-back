import { log } from "@config/Logger";

import { UserEntity } from "@modules/users/models/entity/user.entity";
import { UserRepository } from "@modules/users/repositories/users.repository";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { hash } from "bcryptjs";
import { CollaboratorResponseDTO } from "../models/dto/collaborator-response.dto";
import { UpdateCollaboratorDTO } from "../models/dto/update-collaborator.dto";
import { CollaboratorsServicesEntity } from "../models/entity/collaborator-services.entity";
import { CollaboratorEntity } from "../models/entity/collaborator.entity";
import { CollaboratorServicesRepository } from "../repositories/collaborator-services.repository";
import { CollaboratorRepository } from "../repositories/collaborator.repository";
import { FindCollaboratorService } from "./find-collaborator.service";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class UpdateCollaboratorService {
	constructor(
		//- Services
		private readonly findCollaboratorService: FindCollaboratorService
	) {}

	@Track()
	public async execute(id: string, collaboratorToUpdate: UpdateCollaboratorDTO): Promise<CollaboratorResponseDTO> {
		const collaborator: CollaboratorEntity = await CollaboratorRepository.findOne({ where: { id }});

		if (!collaborator) {
			log.error(`Collaborator not found with id [${id}]`);
			throw new BadRequestException("Colaborador não encontrado");
		}

		const user: UserEntity = await UserRepository.findById(collaborator.userId);

		if (!user) {
			log.error(`User not found with id. ID [${id}]`);
			throw new BadRequestException("Colaborador não encontrado");
		}

		const { name, surname, collaboratorFunction, specialty, servicesIds, hiringDate, whatsApp, email, active, password } = collaboratorToUpdate;
		user.name = name && surname && `${name} ${surname}` !== user.name ? `${name} ${surname}` : user.name;
		user.email = email && email !== user.email ? email : user.email;
		user.password = password ? await hash(password, 10) : user.password;
		user.whatsApp = whatsApp && whatsApp !== user.whatsApp ? whatsApp : user.whatsApp;
		await UserRepository.update(user.id, user);

		collaborator.collaboratorFunction =
			collaboratorFunction && collaboratorFunction !== collaborator.collaboratorFunction ? collaboratorFunction : collaborator.collaboratorFunction;
		collaborator.specialty = specialty && specialty !== collaborator.specialty ? specialty : collaborator.specialty;
		collaborator.hiringDate = hiringDate && hiringDate !== collaborator.hiringDate ? hiringDate : collaborator.hiringDate;
		collaborator.active = active !== null && active !== undefined && active !== collaborator.active ? active : collaborator.active;

		await CollaboratorRepository.update(collaborator.id, collaborator);

		if (servicesIds.length > 0) {
			log.info("Services has changed, update all");
			const services: CollaboratorsServicesEntity[] = await CollaboratorServicesRepository.findAllServicesByCollaboratorId(collaborator.id);
			const savedServicesIds: string[] = services.map(service => service.id);
			const { addedIds, removedIds }: { addedIds: string[]; removedIds: string[] } = this.compareIds(savedServicesIds, servicesIds);
			log.info("Syncronizing relationship between collaborator and services");
			await CollaboratorServicesRepository.syncRelationship(collaborator.id, addedIds, removedIds);
			log.info("Relationship syncronized successfully");
		}

		return await this.findCollaboratorService.execute(collaborator.id);
	}

	@Track()
	public async toggleStatus(collaboratorId: string): Promise<void> {
		if (!collaboratorId) {
			log.error(`Collaborator ID is required but received [${collaboratorId}]`);
			throw new InvalidArgumentException("O ID do colaborador é obrigatório");
		}

		const collaborator: CollaboratorEntity = await CollaboratorRepository.findOne({ where: { id: collaboratorId }});

		if (!collaborator) {
			log.error(`Collaborator not found with ID [${collaboratorId}]`);
			throw new BadRequestException("Colaborador não encontrado");
		}

		await CollaboratorRepository.update(collaborator.id, { active: !collaborator.active });
	}

	private compareIds(savedIds: string[], newIds: string[]): { addedIds: string[]; removedIds: string[] } {
		const savedSet: Set<string> = new Set(savedIds);
		const newSet: Set<string> = new Set(newIds);

		const removedIds: string[] = savedIds.filter(id => !newSet.has(id));
		const addedIds: string[] = newIds.filter(id => !savedSet.has(id));

		return { addedIds, removedIds };
	}
}
