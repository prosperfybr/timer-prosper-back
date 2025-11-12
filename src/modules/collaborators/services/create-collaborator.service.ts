import { log } from "@config/Logger";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { CollaboratorRepository } from "../collaborator.repository";
import { Service } from "@shared/decorators/service.decorator";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { CreateCollaboratorDTO } from "../dto/create-collaborator.dto";
import { CollaboratorServicesRepository } from "../collaborator-services.repository";
import { CreateUserDTO } from "@modules/users/dto/create-user.dto";
import { RolesEnum } from "@modules/users/dto/RolesEnum";
import { CreateUserService } from "@modules/users/services/create-user.service";
import { EstablishmentEntity } from "@modules/establishment/establishment.entity";
import { EstablishmentRepository } from "@modules/establishment/establishment.repository";
import { CollaboratorsServicesEntity } from "../collaborator-services.entity";
import { CollaboratorEntity } from "../collaborator.entity";
import { ServicesRepository } from "@modules/services/services.repository";
import { ServicesEntity } from "@modules/services/services.entity";
import { CollaboratorResponseDTO } from "../dto/collaborator-response.dto";
import moment from "moment";
import { UserResponseDTO } from "@modules/users/dto/user-response.dto";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { UpdateUserService } from "@modules/users/services/update-user.service";
import { UpdateUserDTO } from "@modules/users/dto/update-user.dto";

@Service()
export class CreateCollaboratorService {
	private COLLABORATOR_DEFAULT_PASSWORD: (name: string) => string = (name: string): string => `123-${name}-C0LAB`;

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
      createdAt: collaboratorSaved.createdAt
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
