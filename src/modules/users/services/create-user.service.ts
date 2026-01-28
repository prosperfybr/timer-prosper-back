import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { hash } from "bcryptjs";
import { CreateUserDTO } from "../models/dto/create-user.dto";
import { RolesEnum } from "../models/enum/roles.enum";
import { UserResponseDTO } from "../models/dto/user-response.dto";
import { UserPreferencesEntity } from "../models/entity/user-preferences.entity";
import { UserEntity } from "../models/entity/user.entity";
import { UserPreferencesRepository } from "../repositories/user-preferences.repository";
import { UserRepository } from "../repositories/users.repository";
import { Track } from "@shared/decorators/logs/track.decorator";
import { ClientEstablishmentRepository } from "@modules/establishment/repositories/client-establishment.repository";
import { ClientRequestByEnum } from "@modules/establishment/models/enums/client-request-by.enum";
import { ClientEstablishmentEntity } from "@modules/establishment/models/entity/client-establishment.entity";
import { ClientRequestStatusEnum } from "@modules/establishment/models/enums/client-request-status.enum";

@Service()
export class CreateUserService {
	constructor(
		//- Utils
		private readonly validatorUtils: ValidatorUtils,
		private readonly formatterUtils: FormatterUtils
	) {}

	@Track()
	public async execute(user: CreateUserDTO): Promise<UserResponseDTO> {
		const { name, email, password, cpf, role: newUserRole } = user;
		//- Validate user informations
		this.validate(name, email, password, cpf);
		//- Create user object to save
		const userToSave: UserEntity = new UserEntity();
		userToSave.email = email;
		userToSave.name = name;
		userToSave.password = await hash(password, 10);
		userToSave.role = newUserRole ? newUserRole : RolesEnum.CLIENT;
		userToSave.cpf = cpf ? this.formatterUtils.removeCPFMask(cpf) : null;

		let id: string = null;
		let role: any = null;
		try {
			const { id: userCreatedId, role: userCreatedRole }: UserEntity = await UserRepository.save(userToSave);
			id = userCreatedId;
			role = userCreatedRole;
		} catch (error) {
			log.error(`An error has occurred while save user [${email}]. DATABASE ERROR: `, error);
			throw new BadRequestException("Usuário já cadastrado");
		}

		//- Create user preferences
		const preferences: UserPreferencesEntity = new UserPreferencesEntity();
		preferences.userId = id;
		preferences.darkMode = false;
		preferences.emailNotifications = true;
		preferences.whatsappNotifications = true;

		await UserPreferencesRepository.save(preferences);

		/** VERIFY IF HAS AN INVITE **/
		const invite: ClientEstablishmentEntity = await ClientEstablishmentRepository.findOne({ where : { clientEmail: email }});
		if (invite && invite.requestedBy === ClientRequestByEnum.ESTABLISHMENT) {
			log.info("This user has an invite pending");
			invite.approvedAt = new Date();
			invite.status = ClientRequestStatusEnum.APPROVED;
			invite.updatedAt = new Date();
			invite.userId = id;

			await ClientEstablishmentRepository.save(invite);
		}

		return {
			id,
			name,
			email,
			role,
		} as UserResponseDTO;
	}

	private validate(name: string, email: string, password: string, cpf: string): void {
		if (name.trim().length < 3) {
			log.error("User name is invalid");
			throw new BadRequestException("O nome do usuário é inválido.");
		}

		if (!this.validatorUtils.validateEmail(email)) {
			log.error("User email is invalid");
			throw new BadRequestException("O e-mail informado é inválido.");
		}

		if (!password) {
			log.error("Password is invalid");
			throw new BadRequestException("A senha é inválida.");
		}

		if (cpf !== null && cpf !== undefined && !this.validatorUtils.validateCPF(cpf)) {
			log.error(`The user CPF is invalid. CPF: [${cpf}]`);
			throw new BadRequestException("O CPF informado pelo usuário é inválido");
		}
	}
}
