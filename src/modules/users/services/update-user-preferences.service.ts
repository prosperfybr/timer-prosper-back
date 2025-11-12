import { log } from "@config/Logger";
import { UpdateUserDTO } from "../dto/update-user.dto";
import { UserResponseDTO } from "../dto/user-response.dto";
import { UserEntity } from "../user.entity";
import { UserRepository } from "../users.repository";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { Service } from "@shared/decorators/service.decorator";
import { hash } from "bcryptjs";
import { UpdateUserPreferencesDTO } from "../dto/update-user-preferences.dto";
import { UserPreferencesResponseDTO } from "../dto/user-preferences-response.dto";
import { UserPreferencesRepository } from "../user-preferences.repository";
import { UserPreferencesEntity } from "../user-preferences.entity";
import { UpdateResult } from 'typeorm';

@Service()
export class UpdateUserPreferencesService {
	constructor(
		//- Repositories
		private readonly userRepository: UserRepository,
		private readonly userPreferencesRepository: UserPreferencesRepository,
		//- Utils
		private readonly validatorUtils: ValidatorUtils
	) {}

	public async execute(id: string, preferencesToUpdate: UpdateUserPreferencesDTO): Promise<UserPreferencesResponseDTO> {
		const user: UserEntity = await this.userRepository.findById(id);

		if (!user) {
			log.error(`User not found with id. ID [${id}]`);
			throw new BadRequestException("Usuário não encontrado");
		}

		let preferences: UserPreferencesEntity = await this.userPreferencesRepository.findByUserId(user.id);
		const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(preferences, preferencesToUpdate);

		if (Object.keys(fieldsToUpdate).length === 0) {
			log.warn(`Nothing to update for preferences user [${user.email}]`);
			throw new BadRequestException("Não há nenhuma informação das preferências do usuário para atualizar");
		}

		await this.userPreferencesRepository.update(preferences.id, fieldsToUpdate);
		return {
			id: preferences.id,
			userId: user.id,
			darkMode: fieldsToUpdate.darkMode ? fieldsToUpdate.darkMode : preferences.darkMode,
			emailNotifications: fieldsToUpdate.emailNotifications ? fieldsToUpdate.emailNotifications : preferences.emailNotifications,
			whatsappNotifications: fieldsToUpdate.whatsappNotifications ? fieldsToUpdate.whatsappNotifications : preferences.whatsappNotifications,
		};
	}
}
