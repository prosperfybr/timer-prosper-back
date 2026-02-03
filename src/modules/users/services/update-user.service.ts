import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { hash } from "bcryptjs";
import { UpdateUserDTO } from "../models/dto/update-user.dto";
import { UserResponseDTO } from "../models/dto/user-response.dto";
import { UserEntity } from "../models/entity/user.entity";
import { UserRepository } from "../repositories/users.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class UpdateUserService {
	constructor(private readonly validatorUtils: ValidatorUtils) {}

	@Track()
	public async execute(id: string, userToUpdate: UpdateUserDTO): Promise<UserResponseDTO> {
		const user: UserEntity = await UserRepository.findById(id);
		userToUpdate.profilePreferences = userToUpdate["preferences"];
		delete userToUpdate["preferences"];

		if (!user) {
			log.error(`User not found with id. ID [${id}]`);
			throw new BadRequestException("Usuário não encontrado");
		}

		if ((userToUpdate.userId = user.id)) {
			log.debug(`The user wishes to update their own profile`);
			const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(user, userToUpdate);

			if (Object.keys(fieldsToUpdate).length === 0) {
				log.warn(`Nothing to update for user [${user.email}]`);
				throw new BadRequestException("Não há nenhuma informação do usuário para atualizar");
			}

			if (fieldsToUpdate.password) {
				fieldsToUpdate.password = await hash(fieldsToUpdate.password, 10);
			}

			await UserRepository.update(user.id, fieldsToUpdate);

			//- Verify if profile has been full filled
			const userUpdated: UserEntity = await UserRepository.findById(user.id);
			if (userUpdated.birthDate && userUpdated.cpf && userUpdated.whatsApp) {
				//- User fill all profile fields
				await UserRepository.update(user.id, { profileComplete: true });
			} else if ((!userUpdated.birthDate || !userUpdated.cpf || !userUpdated.whatsApp) && userUpdated.profileComplete === true) {
				//- Case user has deleted any info and profile previously is complete
				await UserRepository.update(user.id, { profileComplete: false });
			}

			return null;
		} else {
			log.debug(`Another user wants to update this user`);
			if (!userToUpdate.userId) {
				log.error("Other user ID is invalid");
				throw new InvalidArgumentException("ID do outro usuário inválido");
			}

			const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(user, userToUpdate);

			if (Object.keys(fieldsToUpdate).length === 0) {
				log.warn(`Nothing to update for user [${user.email}]`);
				throw new BadRequestException("Não há nenhuma informação do usuário para atualizar");
			}

			if (fieldsToUpdate.password) {
				fieldsToUpdate.password = await hash(fieldsToUpdate.password, 10);
			}

			await UserRepository.update(user.id, fieldsToUpdate);
			return null;
		}
	}
}
