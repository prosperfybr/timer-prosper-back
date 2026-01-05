import { AppDataSource } from "@config/ormconfig";
import { In, LessThan, MoreThan } from "typeorm";
import { AppointmentEntity } from "../models/entity/appointment.entity";
import { AppointmentStatusEnum } from "../models/enums/appointment-status.enum";

export const AppointmentRepository = AppDataSource.getRepository(AppointmentEntity).extend({
	async findAllByCollaboratorIdAndDate(collaboratorId: string, startTime: Date, endTime: Date): Promise<AppointmentEntity[]> {
		return await this.find({
			where: {
				collaboratorId,
				status: In([AppointmentStatusEnum.PENDING, AppointmentStatusEnum.CONFIRMED]),
				endTime: MoreThan(startTime),
				startTime: LessThan(endTime),
			},
		});
	},
	async findAllByCollaboratorsIdAndDate(collaboratorIds: string[], startTime: Date, endTime: Date): Promise<AppointmentEntity[]> {
		return await this.find({
			where: {
				collaboratorId: In(collaboratorIds),
				status: In([AppointmentStatusEnum.PENDING, AppointmentStatusEnum.CONFIRMED]),
				endTime: MoreThan(startTime),
				startTime: LessThan(endTime),
			},
		});
	},
	async findAllByIdentifierClient(id: string): Promise<AppointmentEntity[]> {
		let querySchedulers = this.createQueryBuilder("appointment")
			.where("appointment.clientId = :id", { id })
			.orWhere("appointment.serviceId = :id", { id })
			.orWhere("appointment.collaboratorId = :id", { id });

		return querySchedulers.getMany();
	},
	async findAllByEstablishmentCollaborators(collaboratorsIds: string[]): Promise<AppointmentEntity[]> {
		return await this.find({
			where: {
				collaboratorId: In(collaboratorsIds),
			},
		});
	},
	async appointmentsRaw(collaboratorIds: string[], startOfDay: string, endOfDay: string) {
		return await this.createQueryBuilder("appointment")
			.select("appointment.collaboratorId", "collaboratorId")
			.addSelect("CAST(COUNT(appointment.id) AS INTEGER)", "count")
			.addSelect(`SUM(EXTRACT(EPOCH FROM (appointment.endTime - appointment.startTime)) / 60)`, "totalDuration")
			.where("appointment.collaboratorId IN (:...collaboratorIds)", { collaboratorIds })
			.andWhere("appointment.startTime BETWEEN :startOfDay AND :endOfDay", { startOfDay, endOfDay })
			.andWhere("appointment.status IN (:...statuses)", { statuses: ["confirmed", "pending"] })
			.groupBy("appointment.collaboratorId")
			.getRawOne();
	},
	async totalClientsRaw(collaboratorIds: string[]) {
		return await this.createQueryBuilder("appointment")
			.select("appointment.collaboratorId", "collaboratorId")
			.addSelect("CAST(COUNT(DISTINCT appointment.clientId) AS INTEGER)", "clientCount")
			.where("appointment.collaboratorId IN (:...collaboratorIds)", { collaboratorIds })
			.andWhere("appointment.status IN (:...statuses)", { statuses: ["confirmed"] })
			.groupBy("appointment.collaboratorId")
			.getRawOne();
	},
});
