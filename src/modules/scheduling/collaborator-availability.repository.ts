import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { CollaboratorAvailabilityEntity } from "./collaborator-availability.entity";
import { AppDataSource } from "../../../ormconfig";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";

@RepositoryDec()
export class CollaboratorAvailabilityRepository {
	private repository: Repository<CollaboratorAvailabilityEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(CollaboratorAvailabilityEntity);
	}

	public async save(serviceType: CollaboratorAvailabilityEntity): Promise<CollaboratorAvailabilityEntity> {
		return await this.repository.save(serviceType);
	}

	public async findById(id: string): Promise<CollaboratorAvailabilityEntity> {
		return await this.repository.findOne({ where: { id }, relations: ['serviceTypes'] });
	}

	public async findAll(): Promise<CollaboratorAvailabilityEntity[]> {
		return await this.repository.find();
	}

	public async update(id: string, data: Partial<CollaboratorAvailabilityEntity>): Promise<UpdateResult> {
		return await this.repository.update(id, data);
	}

	public async delete(id: string): Promise<DeleteResult> {
		return await this.repository.delete(id);
	}
}
