import { DaysOfWeekEnum } from "@modules/establishment/models/enums/days-of-week.enum";
import { In, LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../../../config/ormconfig";
import { AbsenceBlockEntity } from "../models/entity/absence-block.entity";

export const AbsenceBlockRepository = AppDataSource.getRepository(AbsenceBlockEntity).extend({
	async findById(id: string): Promise<AbsenceBlockEntity> {
		return await this.findOne({ where: { id }, relations: ["serviceTypes"] });
	},
	async findAllByEstablishment(establishmentId: string): Promise<AbsenceBlockEntity[]> {
		return await this.find({ where: { establishmentId } });
	},
	async findAllByCollaboratorIdAndDate(collaboratorId: string, startTime: string, endTime: string): Promise<AbsenceBlockEntity[]> {
		return await this.find({
			where: {
				collaboratorId,
				endTime: MoreThan(startTime),
				startTime: LessThan(endTime),
			},
		});
	},
	async findExisting(
		collaboratorId: string,
		startTime: string,
		endTime: string,
		isRecurrent: boolean,
		dayOfWeek: DaysOfWeekEnum,
		specificDate: string,
	) {
		return await this.find({
			where: {
				collaboratorId,
				endTime,
				startTime,
				isRecurrent,
				recurrenceRule: dayOfWeek?.toString() || specificDate,
			},
		});
	},
	async findByCollaboratorsAndDate(collaboratorsIds: string[], startOfDay: Date, endOfDay: Date): Promise<AbsenceBlockEntity[]> {
		return await this.find({
			where: {
				collaboratorId: In(collaboratorsIds),
				isRecurrent: false,
				isActive: true,
				startTime: LessThan(endOfDay.toString()),
				endTime: MoreThan(startOfDay.toString()),
			},
		});
	},
});
