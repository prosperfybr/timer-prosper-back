import { log } from "@config/Logger";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";
import { ServicesEntity } from "@modules/services/models/entity/services.entity";
import { ServicesRepository } from "@modules/services/repositories/services.repository";
import { CreateUserDTO } from "@modules/users/models/dto/create-user.dto";
import { UpdateUserDTO } from "@modules/users/models/dto/update-user.dto";
import { UserResponseDTO } from "@modules/users/models/dto/user-response.dto";
import { RolesEnum } from "@modules/users/models/enum/roles.enum";
import { CreateUserService } from "@modules/users/services/create-user.service";
import { UpdateUserService } from "@modules/users/services/update-user.service";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { CollaboratorResponseDTO } from "../models/dto/collaborator-response.dto";
import { CreateCollaboratorDTO } from "../models/dto/create-collaborator.dto";
import { CollaboratorsServicesEntity } from "../models/entity/collaborator-services.entity";
import { CollaboratorEntity } from "../models/entity/collaborator.entity";
import { CollaboratorServicesRepository } from "../repositories/collaborator-services.repository";
import { CollaboratorRepository } from "../repositories/collaborator.repository";

@Service()
export class CreateCollaboratorService {
	private COLLABORATOR_DEFAULT_PASSWORD: (name: string) => string = (name: string): string => `${name}`;

	private readonly validationRules = {
		name: { validation: (v: string) => v && v.trim().length > 0, message: "O nome do colaborador é inválido" },
		surname: { validation: (v: string) => v && v.trim().length > 0, message: "O sobrenome é inválido" },
		email: { validation: (v: string) => this.validatorUtils.validateEmail(v), message: "O e-mail do colaborador é inválido" },
		whatsApp: { validation: (v: string) => this.validatorUtils.validateTelephone(v), message: "O WhatsApp é inválido" },
		specialty: { validation: (v: string) => v && v.trim().length > 0, message: "A especialidade do colaborador é inválida" },
		collaboratorFunction: { validation: (v: string) => v && v.trim().length > 0, message: "A função do colaborador é inválida" },
		//hiringDate: { validation: (v: Date) => v && moment(v).isBefore(new Date()), message: "A data de admissão do colaborador é inválida" },
	};

	constructor(
		//- Repositories
		private readonly collaboratorRepository: CollaboratorRepository,
		private readonly collaboratorServicesRepository: CollaboratorServicesRepository,
		private readonly servicesRepository: ServicesRepository,
		private readonly establishmentRepository: EstablishmentRepository,
		//- Services
		private readonly createUserService: CreateUserService,
		private readonly updateUserService: UpdateUserService,
		//- Utils
		private readonly validatorUtils: ValidatorUtils,
		private readonly formatterUtils: FormatterUtils
	) {}

	public async execute(collaborator: CreateCollaboratorDTO): Promise<CollaboratorResponseDTO> {
		log.info("Creating a new collaborator");
		const { name, surname, collaboratorFunction, specialty, servicesIds, establishmentId, hiringDate, email, whatsApp } = collaborator;

		this.validate(collaborator);

		if (servicesIds.length === 0) {
			log.error(`No services ids is received [${servicesIds}]`);
			throw new InvalidArgumentException("O colaborador deve estar associado a pelo menos um serviço");
		}
		const services: ServicesEntity[] = await this.servicesRepository.findByIds(servicesIds);
		if (!services || services.length === 0) {
			log.error(`No services found with IDs`);
			throw new BadRequestException("Não foram encontrados serviços com os IDs informados");
		}

		const establishment: EstablishmentEntity = await this.establishmentRepository.findById(establishmentId);

		if (!establishment) {
			log.error(`Establishment not found with ID [${establishmentId}]`);
			throw new BadRequestException("Estabelecimento não encontrado com o ID informado");
		}

		const collaboratorUserToCreate: CreateUserDTO = {
			name: `${name} ${surname}`,
			email,
			password: this.COLLABORATOR_DEFAULT_PASSWORD(name),
			role: RolesEnum.COLLABORATOR,
		};
		const collaboratorUserCreated: UserResponseDTO = await this.createUserService.execute(collaboratorUserToCreate);

		const collaboratorUserToUpdate: UpdateUserDTO = {
			userId: collaboratorUserCreated.id,
			whatsApp,
		};
		await this.updateUserService.execute(collaboratorUserCreated.id, collaboratorUserToUpdate);

		const collaboratorToSave: CollaboratorEntity = new CollaboratorEntity();
		collaboratorToSave.userId = collaboratorUserCreated.id;
		collaboratorToSave.establishmentId = establishment.id;
		collaboratorToSave.collaboratorFunction = collaboratorFunction;
		collaboratorToSave.specialty = specialty;
		collaboratorToSave.hiringDate = hiringDate;
		const collaboratorSaved: CollaboratorEntity = await this.collaboratorRepository.save(collaboratorToSave);

		const collaboratorServicesRelationshipToSave: CollaboratorsServicesEntity[] = services.map(service => new CollaboratorsServicesEntity(collaboratorSaved.id, service.id));
		const collaboratorServicesRelationshipSaved: CollaboratorsServicesEntity[] = await this.collaboratorServicesRepository.saveAll(collaboratorServicesRelationshipToSave);

		return {
			id: collaboratorSaved.id,
			userId: collaboratorUserCreated.id,
			establishmentId: collaboratorSaved.establishmentId,
			servicesIds: collaboratorServicesRelationshipSaved.map(relation => relation.id),
			collaboratorFunction: collaboratorSaved.collaboratorFunction,
			specialty: collaboratorSaved.specialty,
			hiringDate: collaboratorSaved.hiringDate,
			active: collaboratorSaved.active,
			createdAt: collaboratorSaved.createdAt,
		} as CollaboratorResponseDTO;
	}

	private validate(collaborator: CreateCollaboratorDTO): void {
		const fields = Object.keys(this.validationRules) as (keyof CreateCollaboratorDTO)[];

		for (const field of fields) {
			const value = collaborator[field];
			const rule = this.validationRules[field as keyof typeof this.validationRules];

			if (!rule.validation(value as any)) {
				log.error(`Validation failed for '${field}'. Value: [${value}].`);
				throw new InvalidArgumentException(rule.message);
			}
		}
	}
}
