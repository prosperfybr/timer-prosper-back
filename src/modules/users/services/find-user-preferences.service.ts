import { log } from "@config/Logger";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { Service } from "@shared/decorators/service.decorator";
import { UserPreferencesRepository } from "../user-preferences.repository";
import { UserPreferencesResponseDTO } from "../dto/user-preferences-response.dto";
import { UserPreferencesEntity } from "../user-preferences.entity";

@Service()
export class FindUserPreferencesService {

  constructor(private readonly userPreferencesReposiory: UserPreferencesRepository) {}

  public async getPreferences(userId: string): Promise<UserPreferencesResponseDTO> {
    if (!userId) {
      log.error(`User ID is required, but is received: [${userId}]`);
      throw new InvalidArgumentException("O ID do usuário é obrigatório");
    }

    const preferences: UserPreferencesEntity = await this.userPreferencesReposiory.findByUserId(userId);

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
      updatedAt: preferences.updatedAt
    } as UserPreferencesResponseDTO;
  }

}