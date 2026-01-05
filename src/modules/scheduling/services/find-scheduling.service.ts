import { log } from "@config/Logger";
import { CollaboratorEntity } from "@modules/collaborators/models/entity/collaborator.entity";
import { CollaboratorRepository } from "@modules/collaborators/repositories/collaborator.repository";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { EstablishmentHourRepository } from "@modules/establishment/repositories/establishment-hour.repository";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";
import { SchedulingResponse } from "@modules/scheduling/models/dto/scheduling-response.dto";
import { ServicesEntity } from "@modules/services/models/entity/services.entity";
import { ServicesRepository } from "@modules/services/repositories/services.repository";
import { UserEntity } from "@modules/users/models/entity/user.entity";
import { UserRepository } from "@modules/users/repositories/users.repository";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import moment from "moment";
import { DateRange, extendMoment } from "moment-range";
import { AbsenceBlockRepository } from "../repositories/absence-block.repository";
import { AppointmentRepository } from "../repositories/appointment.repository";

@Service()
export class FindSchedulingService {
	constructor() {}

	public async findAvailableSlots(
		establishmentId: string,
		date: string,
		serviceId: string,
		collaboratorId?: string,
	): Promise<SchedulingResponse.SLOT[]> {
		log.info(
			`Finding all slots available to establishment, service and collaborator. [ESTABLISHMENT: ${establishmentId} | SERVICE: ${serviceId} | COLLABORATOR: ${collaboratorId} | DATE: ${date}]`,
		);

		if (!establishmentId || !serviceId) {
			log.error(`Establishment ID and Service ID are required, but received [ESTABLISHMENT_ID: ${establishmentId} | SERVICE_ID: ${serviceId}]`);
			throw new InvalidArgumentException("O ID do estabelecimento e do serviço são obrigatórios");
		}

		const establishment: EstablishmentEntity = await EstablishmentRepository.findById(establishmentId);

		if (!establishment) {
			log.error(`Establishment not found by ID: [${establishmentId}]`);
			throw new BadRequestException("Estabelecimento não encontrado");
		}

		if (establishment.services.length === 0) {
			log.error(`The establishment hasn't services yet.`);
			throw new BadRequestException("O estabelecimento não atende a este serviço");
		}

		const service: ServicesEntity = establishment.services.filter((service) => service.id === serviceId)[0];

		if (!service) {
			log.error("The establishment not work with this service");
			throw new BadRequestException("O estabelecimento não atende a este serviço");
		}

		const dateMoment = moment(date, "YYYY-MM-DD");
		if (!dateMoment.isValid()) {
			log.error(`Date is invalid. [PARAM_DATE: ${date} | DATE_TO_VALIDATE: ${dateMoment}]`);
			throw new BadRequestException("A data fornecida é inválida");
		}

		const dayOfWeek = dateMoment.isoWeekday();
		const serviceDuration = service.duration;

		const daySlot = await EstablishmentHourRepository.findByEstablishmentAndWeekDay(establishment.id, dayOfWeek);

		if (!daySlot) {
			log.info(`Establishment not work on this date`);
			return [];
		}

		const collaboratorsAvailables: CollaboratorEntity[] = await CollaboratorRepository.findCollaboratorsInEstablishentWorksInService(
			establishment.id,
			service.id,
			collaboratorId,
		);

		if (collaboratorsAvailables.length === 0) {
			log.warn("No collaborators available");
			return [];
		}

		const startOfDay: Date = dateMoment.startOf("day").toDate();
		const endOfDay: Date = dateMoment.endOf("day").toDate();
		const collaboratorsIds: string[] = collaboratorsAvailables.map((collaborator) => collaborator.id);

		const absenceBlocks = await AbsenceBlockRepository.findByCollaboratorsAndDate(collaboratorsIds, startOfDay, endOfDay);
		const existingAppointments = await AppointmentRepository.findAllByCollaboratorsIdAndDate(collaboratorsIds, startOfDay, endOfDay);

		const allSlots: SchedulingResponse.SLOT[] = [];
		const [startHour, startMin] = daySlot.openingTime.split(":").map(Number);
		const [endHour, endMin] = daySlot.closingTime.split(":").map(Number);

		let currentTime = dateMoment.clone().set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
		let endTimeLimit = dateMoment.clone().set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 });

		const slotDuration = serviceDuration;
		const momentRange = extendMoment(moment as any);

		while (currentTime.isBefore(endTimeLimit)) {
			const slotEnd = currentTime.clone().add(serviceDuration, "minutes");

			if (slotEnd.isAfter(endTimeLimit)) {
				break;
			}

			const timeStr = currentTime.format("HH:mm");
			for (const collaborator of collaboratorsAvailables) {
				let isAvailable: boolean = true;
				const proposeRange: DateRange = momentRange.range(currentTime, slotEnd);

				const hasPersonalBlock = absenceBlocks.some((block) => {
					if (block.collaboratorId === collaborator.id) {
						const blockRange = momentRange.range(moment(block.startTime), moment(block.endTime));
						return proposeRange.overlaps(blockRange);
					}
					return false;
				});

				isAvailable = !hasPersonalBlock;
				const isBooked = existingAppointments.some((appointment) => {
					if (appointment.collaboratorId === collaborator.id) {
						const apptRange = momentRange.range(moment(appointment.startTime), moment(appointment.endTime));
						return proposeRange.overlaps(apptRange);
					}
					return false;
				});

				isAvailable = !isBooked;

				const { name: collaboratorName } = await UserRepository.findUserNameByUserId(collaborator.userId);

				allSlots.push({
					date,
					time: timeStr,
					collaboratorId: collaborator.id,
					collaboratorName,
					available: isAvailable,
					serviceId: service.id,
					serviceName: service.name,
					servicePrice: service.price,
					serviceDuration: service.duration,
					establishmentName: establishment.tradeName,
				});
			}

			currentTime = currentTime.add(slotDuration, "minutes");
		}

		log.info(`Slots founded`);
		return allSlots;
	}

	public async findAllClientScheduling(id: string): Promise<SchedulingResponse.SLOT[]> {
		log.info("Finding all schedulings for client or service or collaborator");
		let appointments = null;

		const userCollaborator: UserEntity = await UserRepository.findById(id);
		if (userCollaborator) {
			const collaborator: CollaboratorEntity = await CollaboratorRepository.findByUserId(userCollaborator.id);
			id = collaborator ? collaborator.id : id;
		}

		const establishment: EstablishmentEntity = await EstablishmentRepository.findById(id);
		if (establishment) {
			const collaborators: CollaboratorEntity[] = await CollaboratorRepository.findAllByEstablishmentId(establishment.id);
			const collaboratorsIds: string[] = collaborators.map(collaborator => collaborator.id);
			appointments = await AppointmentRepository.findAllByEstablishmentCollaborators(collaboratorsIds);
		} else appointments = await AppointmentRepository.findAllByIdentifierClient(id);

		if (!appointments || appointments.length === 0) {
			log.info(`This client | service | collaborator has not appointments yet`);
			return [];
		}

		const clientAppointments: SchedulingResponse.SLOT[] = [];

		for (const appointment of appointments) {
			const collaborator: CollaboratorEntity = await CollaboratorRepository.findOne({ where: { id: appointment.collaboratorId }, relations: ["user", "establishment"]});
			const service: ServicesEntity = await ServicesRepository.findById(appointment.serviceId);
			const client: UserEntity = await UserRepository.findById(appointment.clientId);

			clientAppointments.push({
						date: moment(appointment.startTime).format("YYYY-MM-DD"),
						time: null,
						collaboratorId: collaborator.id,
						collaboratorName: collaborator.user.name,
						available: true,
						serviceId: service.id,
						serviceName: service.name,
						servicePrice: service.price,
						serviceDuration: service.duration,
						establishmentName: collaborator.establishment.tradeName,
						id: appointment.id,
						establishmentId: collaborator.establishment.tradeName,
						clientId: client.id,
						clientName: client.name,
						clientWhatsapp: client.whatsApp,
						startTime: moment(appointment.startTime).format('HH:mm'),
						endTime: moment(appointment.endTime).format('HH:mm'),
						status: appointment.status,
						notes: appointment.notes,
						createdAt: appointment.createdAt.toString(),
						updatedAt: appointment.updatedAt.toString(),
					});
		}
		return clientAppointments;
	}
}
