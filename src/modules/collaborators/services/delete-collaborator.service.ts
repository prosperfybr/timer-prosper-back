import { log } from "@config/Logger";
import { DeleteUserService } from "@modules/users/services/delete-user.service";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { CollaboratorEntity } from "../models/entity/collaborator.entity";
import { CollaboratorRepository } from "../repositories/collaborator.repository";

@Service()
export class DeleteCollaboratorService {
	constructor(private readonly collaboratorRepository: CollaboratorRepository, private readonly deleteUserService: DeleteUserService) {}

	public async execute(id: string): Promise<void> {
		if (!id) {
			log.error(`Collaborator id is required, but id is: [${id}]`);
			throw new InvalidArgumentException("O ID do colaborador é obrigatório");
		}

		const collaborator: CollaboratorEntity = await this.collaboratorRepository.findById(id);

		if (!collaborator) {
			log.error(`Collaborator not found with ID`);
			throw new BadRequestException("Colaborador não encontrado com o ID informado");
		}

		await this.deleteUserService.execute(collaborator.userId);
		await this.collaboratorRepository.delete(id);
	}
}
