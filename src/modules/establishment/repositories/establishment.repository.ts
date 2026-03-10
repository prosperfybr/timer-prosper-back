import { AppDataSource } from "@config/ormconfig";
import { EstablishmentEntity } from "../models/entity/establishment.entity";
import { log } from "@config/Logger";
import { validate as validateUUID } from "uuid";
import moment from "moment";

export const EstablishmentRepository = AppDataSource.getRepository(EstablishmentEntity).extend({
	async findByIdOrCode(identifier: string): Promise<EstablishmentEntity> {
		const establishment = await this.findOne({
			where: [{ id: identifier }, { code: identifier }],
			relations: ["user", "services", "segment"],
			order: {
				services: { name: "ASC" },
			},
		});

		return establishment;
	},
	async findAllByUser(userId: string): Promise<EstablishmentEntity[]> {
		return await this.find({ where: { userId } });
	},
	async findByOwnerOrCollaborator(userId: string): Promise<EstablishmentEntity> {
		const establishment: EstablishmentEntity = await this.createQueryBuilder("establishment")
			.leftJoin("establishment.collaborators", "collaborator")
			.where("establishment.userId = :id", { id: userId })
			.orWhere("collaborator.userId = :id", { id: userId })
			.leftJoinAndSelect("establishment.user", "owner")
			.leftJoinAndSelect("establishment.segment", "segment")
			.getOne();

		return establishment;
	},
	async findBySegment(segmentId: string): Promise<EstablishmentEntity[]> {
		return await this.find({ where: { segmentId }, relations: ["user", "segment"] });
	},
	async findOneByIdentifier(identifier: string): Promise<EstablishmentEntity> {
		log.info("Finding establishment by identifier: ", identifier);
		const isUUID: boolean = validateUUID(identifier);
		if (isUUID) {
			log.info("The identifier is an ID: ", identifier);
			return await this.findOne({ where: { id: identifier } });
		} else {
			log.info("The identifier is a code: ", identifier);
			const searchParam: string = `%${identifier.trim()}%`;

			const establishment: EstablishmentEntity = await this.createQueryBuilder("establishment")
				.where(`establishment.id = :searchParam`, { searchParam })
				.orWhere(`establishment.code ILIKE :searchParam`, { searchParam }) //- Find by code
				.orWhere(`establishment.tradeName ILIKE :searchParam`, { searchParam }) //- Find by Name
				.orWhere(`establishment.mainPhone ILIKE :searchParam`, { searchParam }) //- Find by telephone
				.leftJoinAndSelect("establishment.user", "user")
				.orWhere("user.email ILIKE :searchParam", { searchParam }) //- Find by owner email
				.getOne();

			return establishment;
		}
	},
	async findAllByIdentifier(identifier: string): Promise<EstablishmentEntity[]> {
		const searchParam: string = `%${identifier.trim()}%`;

		const establishments: EstablishmentEntity[] = await this.createQueryBuilder("establishment")
			.leftJoinAndSelect("establishment.user", "user")
			.andWhere(`establishment.code ILIKE :searchParam OR establishment.tradeName ILIKE :searchParam`, { searchParam })
			.orderBy("establishment.tradeName", "ASC")
			.getMany();

		return establishments;
	},
	async findEstablishmentCollaboratorsStats(ownerId: string): Promise<any[]> {
		log.info("Finding collaborators stats for establishment");

		const dateMoment = moment.utc(new Date(), "YYYY-MM-DD");
		const startOfDay = dateMoment.clone().startOf("day").format("YYYY-MM-DD HH:mm:ss");
		const endOfDay = dateMoment.clone().endOf("day").format("YYYY-MM-DD HH:mm:ss");
		const dayOfWeek: number = dateMoment.day();

		log.info("Finding appointments between date: ", startOfDay, " and ", endOfDay);

		const sql = `
	SELECT
		(SELECT COUNT(a.id) FROM appointments a INNER JOIN collaborators c ON a.collaborator_id = c.id WHERE c.establishment_id = establishment.id AND a.start_time BETWEEN '${startOfDay}' AND '${endOfDay}') as total_appointments,
		(SELECT COUNT(a.id) FROM appointments a INNER JOIN collaborators c ON a.collaborator_id = c.id WHERE c.establishment_id = establishment.id AND a.status = 'completed' AND a.start_time BETWEEN '${startOfDay}' AND '${endOfDay}') AS total_completed_appointments,
		(SELECT COUNT(a.id) FROM appointments a INNER JOIN collaborators c ON a.collaborator_id = c.id WHERE c.establishment_id = establishment.id AND a.status = 'cancelled' AND a.start_time BETWEEN '${startOfDay}' AND '${endOfDay}') AS total_cancelled_appointments,
		(SELECT COUNT(ce.id) FROM client_establishments ce WHERE ce.establishment_id = establishment.id AND ce.status = 'approved') AS total_clients,
		(SELECT COALESCE(SUM(s.duration), 0) FROM appointments a INNER JOIN collaborators c ON a.collaborator_id = c.id INNER JOIN services s ON a.service_id = s.id WHERE c.establishment_id = establishment.id AND a.start_time BETWEEN '${startOfDay}' AND '${endOfDay}') AS total_scheduled_duration,
		(SELECT COUNT(c.id) FROM collaborators AS c WHERE c.establishment_id = establishment.id) AS total_collaborators,
		establishmentHours.opening_time AS establishment_opening_time,
		establishmentHours.closing_time AS establishment_closing_time,
		appointment.start_time AS appointment_start_time,
		appointment.end_time AS appointment_end_time,
		service.name AS service_name,
		client.name AS client_name
	FROM establishments establishment
		LEFT JOIN collaborators collaborator ON collaborator.establishment_id = establishment.id
		LEFT JOIN appointments appointment ON appointment.collaborator_id = collaborator.id AND appointment.start_time BETWEEN '${startOfDay}' AND '${endOfDay}'
		LEFT JOIN services service ON appointment.service_id = service.id
		LEFT JOIN users client ON client.id = appointment.client_id
		LEFT JOIN establishment_hours establishmentHours ON establishmentHours.establishment_id = establishment.id AND establishmentHours.day_of_week = '${dayOfWeek}'
	WHERE establishment.user_id = '${ownerId}';`;

		console.log(sql);
		const result = await this.query(sql);

		log.info("Collaborators stats for establishment consulted");
		return result.length > 0
			? result.map((row) => {
					return {
						...row,
						totalScheduledDuration: Number(row.totalScheduledDuration || 0),
					};
				})
			: [];
	},
});
