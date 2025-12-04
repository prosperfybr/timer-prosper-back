import { Between, DeleteResult, In, LessThan, MoreThan, Repository, UpdateResult } from "typeorm";
import { AppDataSource } from "../../../config/ormconfig";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";
import { AbsenceBlockEntity } from "../models/entity/absence-block.entity";
import { DaysOfWeekEnum } from "@modules/establishment/models/enums/days-of-week.enum";

@RepositoryDec()
export class AbsenceBlockRepository {
	private repository: Repository<AbsenceBlockEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(AbsenceBlockEntity);
	}

	public async save(serviceType: AbsenceBlockEntity): Promise<AbsenceBlockEntity> {
		return await this.repository.save(serviceType);
	}

	public async findById(id: string): Promise<AbsenceBlockEntity> {
		return await this.repository.findOne({ where: { id }, relations: ["serviceTypes"] });
	}

	public async findAll(): Promise<AbsenceBlockEntity[]> {
		return await this.repository.find();
	}

	public async findAllByEstablishment(establishmentId: string): Promise<AbsenceBlockEntity[]> {
		return await this.repository.find({ where: { establishmentId }});
	}


	public async findAllByCollaboratorIdAndDate(collaboratorId: string, startTime: string, endTime: string): Promise<AbsenceBlockEntity[]> {
		return await this.repository.find({ where: {
			collaboratorId,
			endTime: MoreThan(startTime),
			startTime: LessThan(endTime)
		}});
	}

	public async findExisting(collaboratorId: string, startTime: string, endTime: string, isRecurrent: boolean, dayOfWeek: DaysOfWeekEnum, specificDate: string) {
		return await this.repository.find({ where: {
			collaboratorId,
			endTime,
			startTime,
			isRecurrent,
			recurrenceRule: dayOfWeek?.toString() || specificDate
		}});
	}

	public async findByCollaboratorsAndDate(collaboratorsIds: string[], startOfDay: Date, endOfDay: Date): Promise<AbsenceBlockEntity[]> {
		return await this.repository.find({
			where: {
				collaboratorId: In(collaboratorsIds),
				isRecurrent: false,
				isActive: true,
				startTime: LessThan(endOfDay.toString()),
				endTime: MoreThan(startOfDay.toString()),
			}
		});
	}

	public async update(id: string, data: Partial<AbsenceBlockEntity>): Promise<UpdateResult> {
		return await this.repository.update(id, data);
	}

	public async delete(id: string): Promise<DeleteResult> {
		return await this.repository.delete(id);
	}
}
