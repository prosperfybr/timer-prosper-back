import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { UserResponseDTO } from "../models/dto/user-response.dto";
import { UserEntity } from "../models/entity/user.entity";
import { UserRepository } from "../repositories/users.repository";

@Service()
export class FindUserService {
	constructor(
		//- Repository
		private readonly userRepository: UserRepository,
		//- Utils
		private readonly formatterUtils: FormatterUtils
	) {}

	public async getUser(id: string): Promise<UserResponseDTO> {
		if (!id) {
			log.error(`User ID is required, but is received: [${id}]`);
			throw new InvalidArgumentException("O ID do usuário é obrigatório");
		}

		const user = await this.userRepository.getUserDetails(id);

		if (!user) {
			log.error(`User not found with ID: [${id}]`);
			throw new BadRequestException("Usuário não encontrado com o ID informado");
		}

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			birthDate: user.birthDate,
			whatsApp: user.whatsApp,
			cpf: user.cpf ? this.formatterUtils.addCPFMask(user.cpf) : null,
			profileComplete: user.profileComplete,
			profilePreferences: user.profilePreferences,
			settingsPreferences: user.preferences ? {
				id: user.preferences.id,
				userId: user.id,
				darkMode: user.preferences.darkMode,
				emailNotifications: user.preferences.emailNotifications,
				whatsappNotifications: user.preferences.whatsappNotifications,
			} : 
			{
				id: null,
				userId: user.id,
				darkMode: null,
				emailNotifications: null,
				whatsappNotifications: null,
			},
			establsihmentId: user.establishments ? user.establishments[0].id : null,
			establishments: user.establishments,
		} as UserResponseDTO;
	}

	public async getAllUsers(): Promise<UserResponseDTO[]> {
		const users: UserEntity[] = await this.userRepository.findAll();
		return users.map(user => ({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			profileComplete: user.profileComplete,
			establishments: user.establishments,
		}));
	}
}
