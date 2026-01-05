import { log } from '@config/Logger';
import { CollaboratorsServicesEntity } from '@modules/collaborators/models/entity/collaborator-services.entity';
import { CollaboratorEntity } from '@modules/collaborators/models/entity/collaborator.entity';
import { CollaboratorServicesRepository } from '@modules/collaborators/repositories/collaborator-services.repository';
import { CollaboratorRepository } from '@modules/collaborators/repositories/collaborator.repository';
import { EstablishmentHourEntity } from '@modules/establishment/models/entity/establishment-hour.entity';
import { EstablishmentEntity } from '@modules/establishment/models/entity/establishment.entity';
import { EstablishmentRepository } from '@modules/establishment/repositories/establishment.repository';
import { ServicesEntity } from '@modules/services/models/entity/services.entity';
import { ServicesRepository } from '@modules/services/repositories/services.repository';
import { UserEntity } from '@modules/users/models/entity/user.entity';
import { UserRepository } from '@modules/users/repositories/users.repository';
import { Service } from '@shared/decorators/service.decorator';
import { BadRequestException } from '@shared/exceptions/BadRequestException';
import { InvalidArgumentException } from '@shared/exceptions/InvalidArgumentException';
import moment from 'moment';
import mr, { extendMoment } from 'moment-range';
import { EstablishmentHourRepository } from '../../establishment/repositories/establishment-hour.repository';
import { CreateSchedulingDTO } from '../models/dto/create-scheduling.dto';
import { AppointmentEntity } from '../models/entity/appointment.entity';
import { AbsenceBlockEntity } from '../models/entity/absence-block.entity';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { AbsenceBlockRepository } from '../repositories/absence-block.repository';
import { FindSchedulingService } from './find-scheduling.service';
import { SchedulingResponse } from '../models/dto/scheduling-response.dto';
import { AppointmentStatusEnum } from '../models/enums/appointment-status.enum';

@Service()
export class CreateSchedulingService {
	private readonly validationRules = {
		establishmentId: {
			validation: (v: string) => v && v.trim().length > 0,
			message: 'O ID do estabelecimento é inválido',
		},
		collaboratorId: {
			validation: (v: string) => v && v.trim().length > 0,
			message: 'O ID do colaborador é inválido',
		},
		serviceId: {
			validation: (v: string) => v && v.trim().length > 0,
			message: 'O ID do serviço é inválido',
		},
		clientId: {
			validation: (v: string) => v && v.trim().length > 0,
			message: 'O ID do cliente é inválido',
		},
		date: {
			validation: (v: string) => v && v.trim().length > 0,
			message: 'A data do serviço a ser agendado é inválido',
		},
		startTime: {
			validation: (v: string) => v && v.trim().length > 0,
			message: 'A hora do serviço a ser agendado é inválido',
		},
	};

	constructor(
		//- Service
		private readonly findSchedulingService: FindSchedulingService
	) {}

	public async execute(payload: CreateSchedulingDTO): Promise<any> {
		log.info(`Creating a new scheduling for client-id [${payload.clientId}]`);
		this.validate(payload);
		const { establishmentId, collaboratorId, serviceId, clientId, date, startTime, notes } =
			payload;

		const establishment: EstablishmentEntity =
			await EstablishmentRepository.findById(establishmentId);
		const collaborator: CollaboratorEntity =
			await CollaboratorRepository.findOne({ where: { id: collaboratorId }});
		const service: ServicesEntity = await ServicesRepository.findById(serviceId);
		const client: UserEntity = await UserRepository.findById(clientId);

		if (!establishment || !collaborator || !service || !client) {
			log.error(
				`ESTABLISHMENT || COLLABORATOR || SERVICE || CLIENT not found with id informed. ${JSON.stringify({ establishmentId, establishment, collaboratorId, collaborator, serviceId, service, clientId, client })}`,
			);
			throw new BadRequestException(
				'Informações do agendamento incorretas para marcar um novo horário. Por favor revise e tente novamente',
			);
		}

		/* 1. Verifica se o colaborador é um funcionário do estabelecimento informado */
		if (collaborator.establishmentId !== establishment.id) {
			log.error(`The collaborator founded/ informed not work in establishment selected.`);
			throw new BadRequestException(
				'O colaborador informado não trabalha no estabelecimento informado',
			);
		}

		/* 2. Verifica se o estabelecimento atende ao serviço informado */
		const establishmentMakeService: ServicesEntity[] = establishment.services.filter(
			(service) => service.id === service.id,
		);
		if (establishmentMakeService.length === 0) {
			log.error(`Establishment no provides the chosen service`);
			throw new BadRequestException('O estabelecimento não atende ao serviço escolhido');
		}

		/* 3. Verifica se o colaborador atende ao serviço desejado */
		const collaboratorProvidesService: CollaboratorsServicesEntity[] = (
			await CollaboratorServicesRepository.findAllServicesByCollaboratorId(collaborator.id)
		).filter((services) => services.serviceId === service.id);
		if (collaboratorProvidesService.length === 0) {
			log.error(`Collaborator no provides the chosen service`);
			throw new BadRequestException('O colaborador não atende ao serviço escolhido');
		}

		//- Variáveis de auxilio
		const momentRange = extendMoment(moment as any); //- Configura momentRange
		const selectedDateTime = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm');
		const endTime = selectedDateTime.clone().add(service.duration, 'minutes'); //- Calcula o fim do agendamento
		const dayOfWeek: number = selectedDateTime.isoWeekday(); // 1 (Segunda) a 7 (Domingo)
		const proposedRange = momentRange.range(selectedDateTime, endTime); //- Cria o range do agendamento proposto
		/* 4. Verifica o horário de funcionamento do estabelecimento */
		//- Verifica se o dia escolhido o estabelecimento funciona
		const establishmentOpeningHours: EstablishmentHourEntity =
			await EstablishmentHourRepository.findByEstablishmentAndWeekDay(
				establishment.id,
				dayOfWeek,
			);

		if (!establishmentOpeningHours) {
			log.error(`Establishmento not work this date`);
			throw new BadRequestException('O estabelecimento é fechado neste dia');
		}

		//- Verifica o horário (Cria o range do estabelecimento)
		//- Cria os objetos Moment para a data escolhida, usando os horários de string do Banco de dados
		const openTime: moment.Moment = selectedDateTime
			.clone()
			.startOf('day')
			.add(moment.duration(establishmentOpeningHours.openingTime));
		const closeTime: moment.Moment = selectedDateTime
			.clone()
			.startOf('day')
			.add(moment.duration(establishmentOpeningHours.closingTime));
		const establishmentRange = momentRange.range(openTime, closeTime);

		if (!establishmentRange.contains(proposedRange)) {
			log.error(`Outside of the establishment's operating hours.`);
			throw new BadRequestException('Horário fora do funcionamento do estabelecimento');
		}

		/* 5. Verifica bloqueio */
		//- 5.1 Busca todos os bloqueios para o colaborador no período da data escolhida
		const timeBlocks: AbsenceBlockEntity[] =
			await AbsenceBlockRepository.findAllByCollaboratorIdAndDate(
				collaborator.id,
				selectedDateTime.toDate().toString(),
				endTime.toDate().toString(),
			);
		for (const block of timeBlocks) {
			const blockRange = momentRange.range(moment(block.startTime), moment(block.endTime));
			//- Usa overlaps() para verificar se há qualquer conflito de tempo
			if (proposedRange.overlaps(blockRange)) {
				log.error(`Collaborator is not present or have blocks in period choosed`);
				throw new BadRequestException('Colaborador ausente ou bloqueado neste horário');
			}
		}

		//- 5.2 Verifica período de trabalho recorrente
		const availablilitySlots: SchedulingResponse.SLOT[] = await this.findSchedulingService.findAvailableSlots(establishment.id, date, service.id, collaborator.id);

		let isAvailable: boolean = false;
		for (const slot of availablilitySlots) {
			//- Cria o range de disponibilidade para a data específica
			const slotStart = selectedDateTime
				.clone()
				.startOf('day')
				.add(moment.duration(slot.time));
			const slotEnd = selectedDateTime.clone().startOf('day').add(moment.duration(slot.time + service.duration));
			const availableRange = momentRange.range(slotStart, slotEnd);

			//- Verifica se o slot proposta está totalmente dentro de alguma disponibilidade
			if (availableRange.contains(proposedRange)) {
				isAvailable = true;
				break;
			}
		}

		if (!isAvailable) {
			log.error(`Time out of job scale for this collaborator`);
			throw new BadRequestException('Horário fora da escala de trabalho regular do colaborador');
		}

		/* 5.3 e 6 Verifica conflito com agendamentos existentes */
		const existingAppointments: AppointmentEntity[] =
			await AppointmentRepository.findAllByCollaboratorIdAndDate(
				collaborator.id,
				selectedDateTime.toDate(),
				endTime.toDate(),
			);
		for (const appointment of existingAppointments) {
			const appointmentRange = momentRange.range(
				moment(appointment.startTime),
				moment(appointment.endTime),
			);

			if (proposedRange.overlaps(appointmentRange)) {
				log.error(`Already exist other appointement in this chose hour`);
				throw new BadRequestException(
					'Conflito de horário com outro agendamento. Horário indisponível',
				);
			}
		}

		const appointment: AppointmentEntity = new AppointmentEntity();
		appointment.collaboratorId = collaborator.id;
		appointment.clientId = client.id;
		appointment.serviceId = service.id;
		appointment.startTime = selectedDateTime.toDate();
		appointment.endTime = endTime.toDate();
		appointment.status = AppointmentStatusEnum.CONFIRMED;
		appointment.notes = notes;

		await AppointmentRepository.save(appointment);
		return;
	}

	private validate(collaborator: CreateSchedulingDTO): void {
		const fields = Object.keys(this.validationRules) as (keyof CreateSchedulingDTO)[];

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
