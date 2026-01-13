import { log } from "@config/Logger";
import { CollaboratorEntity } from "@modules/collaborators/models/entity/collaborator.entity";
import { CollaboratorRepository } from "@modules/collaborators/repositories/collaborator.repository";
import { DaysOfWeekEnum } from "@modules/establishment/models/enums/days-of-week.enum";
import { ServicesEntity } from "@modules/services/models/entity/services.entity";
import { ServicesRepository } from "@modules/services/repositories/services.repository";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import moment from "moment";
import { AbsenceBlockResponse } from "../models/dto/absence-block-response.dto";
import { CreateAbsenceBlockDTO } from "../models/dto/create-absence-block.dto";
import { AbsenceBlockEntity } from "../models/entity/absence-block.entity";
import { AbsenceBlockTypeEnum } from "../models/enums/absence-block-type.enum";
import { AbsenceBlockRepository } from "../repositories/absence-block.repository";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class CreateAbsenceBlockService {
	constructor(
		//- Mappers
		private readonly mapper: AbsenceBlockResponse,
		//- Utils
		private readonly formatterUtils: FormatterUtils,
	) {}

	@Track()
	public async execute(payload: CreateAbsenceBlockDTO): Promise<AbsenceBlockResponse.DTO[]> {
		log.info("Creating a new absence for service or collaborator");

		const { type, isRecurrent, specificDate, dayOfWeek, collaboratorId, serviceId, establishmentId, description, startTime, endTime, active } = payload;

		const establishment: EstablishmentEntity = await EstablishmentRepository.findById(establishmentId);

		if (!establishment) {
			log.error(`Establishment not found by id [${establishmentId}]`);
			throw new InvalidArgumentException("Estabelecimento não encontrado com o ID informado");
		}

		if (type === AbsenceBlockTypeEnum.BY_COLLABORATOR)
			return this.mapper.toDto(
				await this.absenceByCollaborator(isRecurrent, specificDate, dayOfWeek, collaboratorId, establishment.id, description, startTime, endTime, active),
			);
		else if (type === AbsenceBlockTypeEnum.BY_SERVICE)
			return this.mapper.toDto(await this.absenceByService(isRecurrent, specificDate, dayOfWeek, serviceId, establishment.id, description, startTime, endTime, active));
		else {
			log.error("Absence type not supported");
			throw new BadRequestException("Tipo de ausência não suportado");
		}
	}

	private async absenceByCollaborator(
		isRecurrent: boolean,
		specificDate: Date,
		dayOfWeek: DaysOfWeekEnum,
		collaboratorId: string,
		establishmentId: string,
		description: string,
		startTime: string,
		endTime: string,
		active: boolean,
	): Promise<AbsenceBlockEntity> {
		if (!collaboratorId) {
			log.error(`Collaborator ID is required, but received [${collaboratorId}]`);
			throw new InvalidArgumentException("O ID do colaborador é inválido");
		}

		const collaborator: CollaboratorEntity = await CollaboratorRepository.findOne({ where: { id: collaboratorId }});

		if (!collaborator) {
			log.error(`Collaborator not found by ID [${collaboratorId}]`);
			throw new BadRequestException("Colaborador não encontrado");
		}

		//- Verify if already exists an absence
		const absenceAlreadyExists = await AbsenceBlockRepository.findExisting(
			collaboratorId,
			startTime,
			endTime,
			isRecurrent,
			dayOfWeek,
			specificDate?.toString(),
		);

		if (absenceAlreadyExists && absenceAlreadyExists.length > 0) {
			log.warn("Absence already exists");
			throw new BadRequestException("Ausência já cadastrada");
		}

		return this.absenceFlow(isRecurrent, specificDate, dayOfWeek, description, startTime, endTime, active, establishmentId, null, collaboratorId);
	}

	private async absenceByService(
		isRecurrent: boolean,
		specificDate: Date,
		dayOfWeek: DaysOfWeekEnum,
		serviceId: string,
		establishmentId: string,
		description: string,
		startTime: string,
		endTime: string,
		active: boolean,
	): Promise<AbsenceBlockEntity> {
		if (!serviceId) {
			log.error(`Service ID is required, but received [${serviceId}]`);
			throw new InvalidArgumentException("O ID do serviço é inválido");
		}

		const service: ServicesEntity = await ServicesRepository.findById(serviceId);

		if (!service) {
			log.error(`Service not found by ID [${serviceId}]`);
			throw new BadRequestException("Serviço não encontrado");
		}

		//- Verify if already exists an absence
		const absenceAlreadyExists = await AbsenceBlockRepository.findExisting(
			serviceId,
			startTime,
			endTime,
			isRecurrent,
			dayOfWeek,
			specificDate?.toString(),
		);

		if (absenceAlreadyExists && absenceAlreadyExists.length > 0) {
			log.warn("Absence already exists");
			throw new BadRequestException("Ausência já cadastrada");
		}

		return this.absenceFlow(isRecurrent, specificDate, dayOfWeek, description, startTime, endTime, active, establishmentId, serviceId);
	}

	/**
	 * @access private
	 * @param description Absence Description, can be includes time
	 *
	 * @returns {string[]} ["13:00", "15:00"], sendo apenas os horários de início e fim da ausência
	 *
	 */
	private findATimeInDescription(description: string): string[] {
		const timeRegex = /(?:^|\s)(\d{1,2}(?::\d{2}(?::\d{2})?|h\s*\d{2}m(?:\s*\d{2}s)?|h(?!\s)))(\s|$)/gi;

		let rawTimeMatches: string[] = [];
		let match;

		while ((match = timeRegex.exec(description)) !== null) {
			rawTimeMatches.push(match[1]);
		}

		return rawTimeMatches;
	}

	private async absenceFlow(
		isRecurrent: boolean,
		specificDate: Date,
		dayOfWeek: DaysOfWeekEnum,
		description: string,
		startTime: string,
		endTime: string,
		active: boolean,
		establishmentId: string,
		serviceId?: string,
		collaboratorId?: string,
	): Promise<AbsenceBlockEntity> {
		if (isRecurrent && specificDate) {
			log.error("Is not possible a specific date be recurrent");
			throw new InvalidArgumentException("Não é possível tornar uma data como ausência recorrente");
		}

		let absenceStartTime: string = startTime;
		let absenceEndTime: string = endTime;

		if (description && !startTime && !endTime) {
			const descriptionAbsenseRecognizedTimes: string[] = this.findATimeInDescription(description);
			absenceStartTime = descriptionAbsenseRecognizedTimes[0];
			absenceEndTime = descriptionAbsenseRecognizedTimes[1];
		}

		const newAbsence = new AbsenceBlockEntity();
		newAbsence.collaboratorId = collaboratorId;
		newAbsence.serviceId = serviceId;
		newAbsence.establishmentId = establishmentId;
		newAbsence.startTime = absenceStartTime ? this.formatterUtils.formatTime(absenceStartTime) : null;
		newAbsence.endTime = absenceEndTime ? this.formatterUtils.formatTime(absenceEndTime) : null;
		newAbsence.description = description;
		newAbsence.isRecurrent = isRecurrent;
		newAbsence.recurrenceRule = dayOfWeek ? dayOfWeek.toString() : moment(specificDate).toString();
		newAbsence.isActive = active;

		return await AbsenceBlockRepository.save(newAbsence);
	}
}
