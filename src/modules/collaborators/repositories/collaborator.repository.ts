import { log } from "@config/Logger";
import { AppDataSource } from "@config/ormconfig";
import { CollaboratorEntity } from "../models/entity/collaborator.entity";
import moment from "moment";

export const CollaboratorRepository = AppDataSource.getRepository(CollaboratorEntity).extend({
	async findAllByEstablishmentId(establishmentId: string): Promise<CollaboratorEntity[]> {
		return await this.find({ where: { establishmentId } });
	},
	async findCollaboratorsInEstablishentWorksInService(
		establishmentId: string,
		serviceId: string,
		collaboratorId: string,
	): Promise<CollaboratorEntity[]> {
		let queryCollaborators = this.createQueryBuilder("collaborator")
			.where("collaborator.establishmentId = :establishmentId", { establishmentId })
			.andWhere("collaborator.active = :isActive", { isActive: true })
			.innerJoinAndSelect("collaborators_services", "serviceLink", "serviceLink.serviceId = :serviceId", { serviceId });

		if (collaboratorId !== null && collaboratorId !== undefined)
			queryCollaborators = queryCollaborators.andWhere("collaborator.id = :id", { id: collaboratorId });

		return await queryCollaborators.getMany();
	},
	async findByUserId(userId: string): Promise<CollaboratorEntity> {
		return await this.findOne({ where: { userId } });
	},
	async findCollaboratorInformations(collaboratorId: string): Promise<any> {
		log.info(`Finding all informations for collaborator [${collaboratorId}`);
		const result = await this.createQueryBuilder("collaborator")
			.where("collaborator.id = :collaboratorId", { collaboratorId })
			.innerJoinAndSelect("collaborator.user", "user")
			.innerJoinAndSelect("collaborator.establishment", "establishment")
			.innerJoinAndSelect("collaborators_services", "collabServices", "collabServices.collaboratorId = collaborator.id")
			.innerJoinAndSelect("services", "service", "service.id = collabServices.serviceId")
			.getRawMany();
		log.info("All informations for collaborator consulted");
		return result.length > 0 ? result : [];
	},
	async findEstablishmentCollaborators(establishmentId: string): Promise<any> {
		log.info("Finding all collaborators for establishment");
		const result = await this.createQueryBuilder("collaborator")
			.where("collaborator.establishment_id = :establishmentId", { establishmentId })
			.innerJoinAndSelect("collaborator.user", "user")
			.innerJoinAndSelect("collaborator.establishment", "establishment")
			.innerJoinAndSelect("collaborators_services", "collabServices", "collabServices.collaboratorId = collaborator.id")
			.innerJoinAndSelect("services", "service", "service.id = collabServices.serviceId")
			.getRawMany();
		log.info("All collaborators for establishment consulted");
		return result.length > 0 ? result : [];
	},
	async findCollaboratorStats(collaboratorId: string): Promise<any> {
		log.info(`Finding stats for collaborator [${collaboratorId}]`);

		const dateMoment = moment.utc(new Date(), "YYYY-MM-DD");
		const startOfDay = dateMoment.clone().startOf("day").format("YYYY-MM-DD HH:mm:ss");
		const endOfDay = dateMoment.clone().endOf("day").format("YYYY-MM-DD HH:mm:ss");
		const dayOfWeek: number = dateMoment.day();

		log.info("Finding appointments between date: ", startOfDay, " and ", endOfDay);

		const sql: string = `
		SELECT
		COUNT(appointment.id) as total_appointments,
		SUM(CASE WHEN appointment.status = 'completed' THEN 1 ELSE 0 END) AS total_completed_appointments,
		SUM(CASE WHEN appointment.status = 'cancelled' THEN 1 ELSE 0 END) AS total_cancelled_appointments,
		SUM(CASE WHEN clientEstablishment.status = 'approved' THEN 1 ELSE 0 END) AS total_clients,
		COALESCE(SUM(service.duration), 0) AS total_scheduled_duration,
		establishmentHours.opening_time AS establishment_opening_time,
		establishmentHours.closing_time AS establishment_closing_time,
		appointment.start_time AS appointment_start_time,
		appointment.end_time AS appointment_end_time,
		service.name AS service_name,
		client.name AS client_name
		FROM collaborators collaborator
						LEFT JOIN establishments establishment ON collaborator.establishment_id = establishment.id
						LEFT JOIN appointments appointment ON appointment.collaborator_id = collaborator.id AND appointment.start_time BETWEEN '${startOfDay}' AND '${endOfDay}'
						LEFT JOIN services service ON appointment.service_id = service.id
						LEFT JOIN client_establishments clientEstablishment ON clientEstablishment.establishment_id = establishment.id
						LEFT JOIN users client ON client.id = clientEstablishment.user_id
						LEFT JOIN establishment_hours establishmentHours ON establishmentHours.establishment_id = establishment.id AND establishmentHours.day_of_week = '${dayOfWeek}'
		WHERE collaborator.user_id = '${collaboratorId}'
		GROUP BY collaborator.id, establishment.id, appointment.id, establishmentHours.id, service.name, client.name;`;

		const result = await this.query(sql);
		log.info(`Stats for collaborator [${collaboratorId}] consulted`);
		return result ? result : null;
	},
});
