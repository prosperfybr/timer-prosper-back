import { Between, DeleteResult, LessThan, MoreThan, Repository, UpdateResult } from "typeorm";
import { AppDataSource } from "../../../../ormconfig";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";
import { TimeBlockEntity } from "../models/entity/time-block.entity";

@RepositoryDec()
export class TimeBlockRepository {
	private repository: Repository<TimeBlockEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(TimeBlockEntity);
	}

	public async save(serviceType: TimeBlockEntity): Promise<TimeBlockEntity> {
		return await this.repository.save(serviceType);
	}

	public async findById(id: string): Promise<TimeBlockEntity> {
		return await this.repository.findOne({ where: { id }, relations: ["serviceTypes"] });
	}

	public async findAll(): Promise<TimeBlockEntity[]> {
		return await this.repository.find();
	}

	public async findAllByCollaboratorIdAndDate(collaboratorId: string, startTime: Date, endTime: Date): Promise<TimeBlockEntity[]> {
		return await this.repository.find({ where: {
			collaboratorId,
			endTime: MoreThan(startTime),
			startTime: LessThan(endTime)
		}});
	}

	public async update(id: string, data: Partial<TimeBlockEntity>): Promise<UpdateResult> {
		return await this.repository.update(id, data);
	}

	public async delete(id: string): Promise<DeleteResult> {
		return await this.repository.delete(id);
	}
}
