import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { SegmentEntity } from "./segment.entity";
import { AppDataSource } from "../../../ormconfig";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";

@RepositoryDec()
export class SegmentRepository {
	private repository: Repository<SegmentEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(SegmentEntity);
	}

	public async save(serviceType: SegmentEntity): Promise<SegmentEntity> {
		return await this.repository.save(serviceType);
	}

	public async findById(id: string): Promise<SegmentEntity> {
		return await this.repository.findOne({ where: { id }, relations: ['serviceTypes'] });
	}

	public async findAll(): Promise<SegmentEntity[]> {
		return await this.repository.find();
	}

	public async findAllActive(): Promise<SegmentEntity[]> {
		return await this.repository.find({ where: { isActive: true }});
	}

	public async update(id: string, data: Partial<SegmentEntity>): Promise<UpdateResult> {
		return await this.repository.update(id, data);
	}

	public async delete(id: string): Promise<DeleteResult> {
		return await this.repository.delete(id);
	}
}
