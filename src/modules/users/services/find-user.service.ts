import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { UserPreferencesResponseDTO } from "../models/dto/user-preferences-response.dto";
import { UserResponseDTO } from "../models/dto/user-response.dto";
import { UserEntity } from "../models/entity/user.entity";
import { UserRepository } from "../repositories/users.repository";
import { FindUserPreferencesService } from "./find-user-preferences.service";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";

@Service()
export class FindUserService {
	constructor(
		//- Repository
		private readonly userReposiory: UserRepository,
		private readonly establishmentRepository: EstablishmentRepository,
		//- Services
		private readonly findUserPreferencesService: FindUserPreferencesService,
		//- Utils
		private readonly formatterUtils: FormatterUtils
	) {}

	public async getUser(id: string): Promise<UserResponseDTO> {
		if (!id) {
			log.error(`User ID is required, but is received: [${id}]`);
			throw new InvalidArgumentException("O ID do usuário é obrigatório");
		}
		console.log("Buscando o usuário");
		const user: UserEntity = await this.userReposiory.findById(id);
		console.log("Usuário encontrado: USER: ", user);

		if (!user) {
			log.error(`User not found with ID: [${id}]`);
			throw new BadRequestException("Usuário não encontrado com o ID informado");
		}

		const establishment: EstablishmentEntity = await this.establishmentRepository.findByOwnerOrCollaborator(user.id);

		let settingsPreferences: UserPreferencesResponseDTO = null;
		try {
			settingsPreferences = await this.findUserPreferencesService.getPreferences(user.id);
		} catch (error) {
			settingsPreferences = {
				id: null,
				userId: user.id,
				darkMode: null,
				emailNotifications: null,
				whatsappNotifications: null,
			};
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
			settingsPreferences,
			establsihmentId: establishment ? establishment.id : null,
			establishments: user.establishments,
		} as UserResponseDTO;
	}

	public async getAllUsers(): Promise<UserResponseDTO[]> {
		const users: UserEntity[] = await this.userReposiory.findAll();
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
