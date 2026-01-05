import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { UserPreferencesResponseDTO } from "../models/dto/user-preferences-response.dto";
import { UserPreferencesEntity } from "../models/entity/user-preferences.entity";
import { UserPreferencesRepository } from "../repositories/user-preferences.repository";

@Service()
export class FindUserPreferencesService {
	constructor() {}

	public async getPreferences(userId: string): Promise<UserPreferencesResponseDTO> {
		if (!userId) {
			log.error(`User ID is required, but is received: [${userId}]`);
			throw new InvalidArgumentException("O ID do usuário é obrigatório");
		}

		const preferences: UserPreferencesEntity = await UserPreferencesRepository.findByUserId(userId);

		if (!preferences) {
			log.error(`User preferences not found with user ID: [${userId}]`);
			throw new BadRequestException("Preferências do usuário não encontrado com o ID de usuário informado");
		}

		return {
			id: preferences.id,
			userId: preferences.userId,
			darkMode: preferences.darkMode,
			emailNotifications: preferences.emailNotifications,
			whatsappNotifications: preferences.whatsappNotifications,
			createdAt: preferences.createdAt,
			updatedAt: preferences.updatedAt,
		} as UserPreferencesResponseDTO;
	}
}
