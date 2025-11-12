import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { DeleteUserService } from "@modules/users/services/delete-user.service";
import { CollaboratorRepository } from "../collaborator.repository";
import { CollaboratorEntity } from "../collaborator.entity";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

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
