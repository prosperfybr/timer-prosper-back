import { Service } from "@shared/decorators/service.decorator";
import { EstablishmentRepository } from "../establishment.repository";
import { UserRepository } from "@modules/users/users.repository";
import { CreateEstablishmentDTO } from "../dto/create-establishment.dto";
import { EstablishmentResponseDTO } from "../dto/establishment-response.dto";
import { log } from "@config/Logger";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { UserEntity } from "@modules/users/user.entity";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { EstablishmentEntity } from "../establishment.entity";
import { RolesEnum } from "@modules/users/dto/RolesEnum";

@Service()
export class CreateEstablishmentService {
	private readonly validationRules = {
		tradeName: { validation: (v: string) => v && v.trim().length > 0, message: "O nome do estabelecimento é inválido" },
		zipCode: { validation: (v: string) => this.validatorUtils.validateZipCode(v), message: "O CEP é inválido" },
		street: { validation: (v: string) => v && v.trim().length > 0, message: "A rua é inválida" },
		number: { validation: (v: string) => v && v.trim().length > 0, message: "O número é inválido" },
		neighborhood: { validation: (v: string) => v && v.trim().length > 0, message: "O logradouro é inválido" },
		city: { validation: (v: string) => v && v.trim().length > 0, message: "A cidade é inválida" },
		state: { validation: (v: string) => v && v.trim().length > 0, message: "O estado é inválido" },
		mainPhone: { validation: (v: string) => this.validatorUtils.validateTelephone(v), message: "O telefone principal é inválido" },
	};

	constructor(
		//- Repositories
		private readonly establishmentRepository: EstablishmentRepository,
		private readonly userRepository: UserRepository,
		//- Utils
		private readonly validatorUtils: ValidatorUtils
	) {}

	public async execute(payload: CreateEstablishmentDTO): Promise<EstablishmentResponseDTO> {
		const { userId, tradeName, logo, logoDark, zipCode, street, number, complement, neighborhood, city, state, mainPhone, website, instagram, linkedin, tiktok, youtube } = payload;

		if (!userId || userId.trim().length === 0) {
			log.error(`User id is invalid. User ID is required, but value receved is [${userId}]`);
			throw new InvalidArgumentException("O ID do proprietário do estabelecimento é obrigatório");
		}

		const user: UserEntity = await this.userRepository.findById(userId);
		if (!user) {
			log.error(`User not found`);
			throw new BadRequestException("Proprietário não encontrado para o estabelecimento");
		}

		this.validateEstablishment(payload);

		//- Save establishment
		const establishmentToSave: EstablishmentEntity = new EstablishmentEntity();
		establishmentToSave.userId = user.id;
		establishmentToSave.tradeName = tradeName;
		establishmentToSave.logo = logo;
		establishmentToSave.logoDark = logoDark;
		establishmentToSave.zipCode = zipCode;
		establishmentToSave.street = street;
		establishmentToSave.number = number;
		establishmentToSave.complement = complement;
		establishmentToSave.neighborhood = neighborhood;
		establishmentToSave.city = city;
		establishmentToSave.state = state;
		establishmentToSave.mainPhone = mainPhone;
		establishmentToSave.website = website;
		establishmentToSave.instagram = instagram;
		establishmentToSave.linkedin = linkedin;
		establishmentToSave.tiktok = tiktok;
		establishmentToSave.youtube = youtube;

		const establishmentSaved: EstablishmentEntity = await this.establishmentRepository.save(establishmentToSave);

		//- Update user to OWNER
		/**
		 * todo -> Revisar esta atualização de perfil depois que o sistema de pagamentos estiver implementado
		 */
		if (user.role == RolesEnum.OWNER || user.role == RolesEnum.ADMIN) log.info(`User is already [${RolesEnum.OWNER}], nothing to update in a user role`);
		else {
			log.info(`User isn't a [${RolesEnum.OWNER}]. It is a [${user.role}]. Updating a user role`);
			await this.userRepository.update(user.id, {role: RolesEnum.OWNER});
			log.info(`User [${user.email}] now is a ${user.role}`);
		}

		return {
			id: establishmentSaved.id,
			userId: user.id,
			tradeName: establishmentSaved.tradeName,
			logo: establishmentSaved.logo,
			logoDark: establishmentSaved.logoDark,
			zipCode: establishmentSaved.zipCode,
			street: establishmentSaved.street,
			number: establishmentSaved.number,
			complement: establishmentSaved.complement,
			neighborhood: establishmentSaved.neighborhood,
			city: establishmentSaved.city,
			state: establishmentSaved.state,
			mainPhone: establishmentSaved.mainPhone,
			website: establishmentSaved.website,
			instagram: establishmentSaved.instagram,
			linkedin: establishmentSaved.linkedin,
			tiktok: establishmentSaved.tiktok,
			youtube: establishmentSaved.youtube,
			createdAt: establishmentSaved.createdAt,
			user: null,
			services: [],
		} as EstablishmentResponseDTO;
	}

	private validateEstablishment(payload: CreateEstablishmentDTO) {
		const fields = Object.keys(this.validationRules) as (keyof CreateEstablishmentDTO)[];

		for (const field of fields) {
			const value = payload[field];
			const rule = this.validationRules[field as keyof typeof this.validationRules];

			if (!rule.validation(value)) {
				log.error(`Validation failed for '${field}'. Value: [${value}].`);
				throw new InvalidArgumentException(rule.message);
			}
		}
	}
}
