import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { UserPreferencesEntity } from "../models/entity/user-preferences.entity";
import { UserEntity } from "../models/entity/user.entity";
import { UserPreferencesRepository } from "../repositories/user-preferences.repository";
import { UserRepository } from "../repositories/users.repository";

@Service()
export class DeleteUserService {
	constructor(private readonly userRepository: UserRepository, private readonly userPreferencesRepository: UserPreferencesRepository) {}

	public async execute(id: string): Promise<void> {
		if (!id) {
			log.error(`User id is required, but id is: [${id}]`);
			throw new InvalidArgumentException("O ID do usuário é obrigatório");
		}

		const user: UserEntity = await this.userRepository.findById(id);

		if (!user) {
			log.error(`User not found with id: [${id}]`);
			throw new InvalidArgumentException("Usuário não encontrado com o id informado");
		}

		const preferences: UserPreferencesEntity = await this.userPreferencesRepository.findByUserId(user.id);

		await this.userPreferencesRepository.delete(preferences.id);
		await this.userRepository.delete(id);
	}
}
