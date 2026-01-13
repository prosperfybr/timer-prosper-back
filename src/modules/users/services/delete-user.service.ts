import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { UserPreferencesEntity } from "../models/entity/user-preferences.entity";
import { UserPreferencesRepository } from "../repositories/user-preferences.repository";
import { UserRepository } from "../repositories/users.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class DeleteUserService {
	constructor() {}

	@Track()
	public async execute(id: string): Promise<void> {
		if (!id) {
			log.error(`User id is required, but id is: [${id}]`);
			throw new InvalidArgumentException("O ID do usuário é obrigatório");
		}

		const preferences: UserPreferencesEntity = await UserPreferencesRepository.findByUserId(id);
		await UserPreferencesRepository.delete(preferences.id);
		await UserRepository.delete(id);
	}
}
