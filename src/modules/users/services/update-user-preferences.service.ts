import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { UpdateUserPreferencesDTO } from "../models/dto/update-user-preferences.dto";
import { UserPreferencesResponseDTO } from "../models/dto/user-preferences-response.dto";
import { UserPreferencesEntity } from "../models/entity/user-preferences.entity";
import { UserEntity } from "../models/entity/user.entity";
import { UserPreferencesRepository } from "../repositories/user-preferences.repository";
import { UserRepository } from "../repositories/users.repository";

@Service()
export class UpdateUserPreferencesService {
	constructor(private readonly validatorUtils: ValidatorUtils) {}

	public async execute(id: string, preferencesToUpdate: UpdateUserPreferencesDTO): Promise<UserPreferencesResponseDTO> {
		const user: UserEntity = await UserRepository.findById(id);

		if (!user) {
			log.error(`User not found with id. ID [${id}]`);
			throw new BadRequestException("Usuário não encontrado");
		}

		let preferences: UserPreferencesEntity = await UserPreferencesRepository.findByUserId(user.id);
		const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(preferences, preferencesToUpdate);

		if (Object.keys(fieldsToUpdate).length === 0) {
			log.warn(`Nothing to update for preferences user [${user.email}]`);
			throw new BadRequestException("Não há nenhuma informação das preferências do usuário para atualizar");
		}

		await UserPreferencesRepository.update(preferences.id, fieldsToUpdate);
		return {
			id: preferences.id,
			userId: user.id,
			darkMode: fieldsToUpdate.darkMode ? fieldsToUpdate.darkMode : preferences.darkMode,
			emailNotifications: fieldsToUpdate.emailNotifications ? fieldsToUpdate.emailNotifications : preferences.emailNotifications,
			whatsappNotifications: fieldsToUpdate.whatsappNotifications ? fieldsToUpdate.whatsappNotifications : preferences.whatsappNotifications,
		};
	}
}
