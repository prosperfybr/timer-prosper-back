import { log } from "@config/Logger";

import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { Service } from "@shared/decorators/service.decorator";
import { hash } from "bcryptjs";
import { UserRepository } from "@modules/users/users.repository";
import { CollaboratorRepository } from "../collaborator.repository";
import { UpdateCollaboratorDTO } from "../dto/update-collaborator.dto";
import { CollaboratorEntity } from "../collaborator.entity";
import { UserEntity } from "@modules/users/user.entity";
import { CollaboratorServicesRepository } from "../collaborator-services.repository";
import { CollaboratorsServicesEntity } from "../collaborator-services.entity";
import { FindCollaboratorService } from "./find-collaborator.service";
import { CollaboratorResponseDTO } from "../dto/collaborator-response.dto";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";

@Service()
export class UpdateCollaboratorService {
	constructor(
		//- Repositories
		private readonly collaboratorRepository: CollaboratorRepository,
		private readonly userRepository: UserRepository,
		private readonly collaboratorServicesRepository: CollaboratorServicesRepository,
		//- Services
		private readonly findCollaboratorService: FindCollaboratorService
	) {}

	public async execute(id: string, collaboratorToUpdate: UpdateCollaboratorDTO): Promise<CollaboratorResponseDTO> {
		const collaborator: CollaboratorEntity = await this.collaboratorRepository.findById(id);

		if (!collaborator) {
			log.error(`Collaborator not found with id [${id}]`);
			throw new BadRequestException("Colaborador não encontrado");
		}

		const user: UserEntity = await this.userRepository.findById(collaborator.userId);

		if (!user) {
			log.error(`User not found with id. ID [${id}]`);
			throw new BadRequestException("Colaborador não encontrado");
		}

		const { name, surname, collaboratorFunction, specialty, servicesIds, hiringDate, whatsApp, email, active, password } = collaboratorToUpdate;
		user.name = name && surname && `${name} ${surname}` !== user.name ? `${name} ${surname}` : user.name;
		user.email = email && email !== user.email ? email : user.email;
		user.password = password ? await hash(password, 10) : user.password;
		user.whatsApp = whatsApp && whatsApp !== user.whatsApp ? whatsApp : user.whatsApp;
		await this.userRepository.update(user.id, user);

		collaborator.collaboratorFunction =
			collaboratorFunction && collaboratorFunction !== collaborator.collaboratorFunction ? collaboratorFunction : collaborator.collaboratorFunction;
		collaborator.specialty = specialty && specialty !== collaborator.specialty ? specialty : collaborator.specialty;
		collaborator.hiringDate = hiringDate && hiringDate !== collaborator.hiringDate ? hiringDate : collaborator.hiringDate;
		collaborator.active = active !== null && active !== undefined && active !== collaborator.active ? active : collaborator.active;

		await this.collaboratorRepository.update(collaborator.id, collaborator);

		if (servicesIds.length > 0) {
			log.info("Services has changed, update all");
			const services: CollaboratorsServicesEntity[] = await this.collaboratorServicesRepository.findAllServicesByCollaboratorId(collaborator.id);
			const savedServicesIds: string[] = services.map(service => service.id);
			const { addedIds, removedIds }: { addedIds: string[]; removedIds: string[] } = this.compareIds(savedServicesIds, servicesIds);
			log.info("Syncronizing relationship between collaborator and services");
			await this.collaboratorServicesRepository.syncRelationship(collaborator.id, addedIds, removedIds);
			log.info("Relationship syncronized successfully");
		}

		return await this.findCollaboratorService.execute(collaborator.id);
	}

	public async toggleStatus(collaboratorId: string): Promise<void> {
		if (!collaboratorId) {
			log.error(`Collaborator ID is required but received [${collaboratorId}]`);
			throw new InvalidArgumentException("O ID do colaborador é obrigatório");
		}

		const collaborator: CollaboratorEntity = await this.collaboratorRepository.findById(collaboratorId);

		if (!collaborator) {
			log.error(`Collaborator not found with ID [${collaboratorId}]`);
			throw new BadRequestException("Colaborador não encontrado");
		}

		await this.collaboratorRepository.update(collaborator.id, { active: !collaborator.active });
	}

	private compareIds(savedIds: string[], newIds: string[]): { addedIds: string[]; removedIds: string[] } {
		const savedSet: Set<string> = new Set(savedIds);
		const newSet: Set<string> = new Set(newIds);

		const removedIds: string[] = savedIds.filter(id => !newSet.has(id));
		const addedIds: string[] = newIds.filter(id => !savedSet.has(id));

		return { addedIds, removedIds };
	}
}
