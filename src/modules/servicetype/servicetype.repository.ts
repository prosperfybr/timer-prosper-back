import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { ServiceTypeEntity } from "./servicetype.entity";
import { AppDataSource } from "../../../ormconfig";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";

@RepositoryDec()
export class ServiceTypeRepository {
	private repository: Repository<ServiceTypeEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(ServiceTypeEntity);
	}

	public async save(serviceType: ServiceTypeEntity): Promise<ServiceTypeEntity> {
		return await this.repository.save(serviceType);
	}

	public async findById(id: string): Promise<ServiceTypeEntity> {
		return await this.repository.findOne({ where: { id }, relations: ['services'] });
	}

	public async findAll(): Promise<ServiceTypeEntity[]> {
		return await this.repository.find();
	}

	public async findByEstablishment(establishmentId: string): Promise<ServiceTypeEntity[]> {
		const query = this.repository
			.createQueryBuilder("serviceType")
			.innerJoin("serviceType.services", "service", "service.establishmentId = :establishmentId", { establishmentId })
			.select(["serviceType.id", "serviceType.name", "serviceType.description", "serviceType.createdAt", "serviceType.updatedAt"])
			.distinct(true)
			.orderBy("serviceType.name", "ASC");
		return await query.getMany();
	}

	public async update(id: string, data: Partial<ServiceTypeEntity>): Promise<UpdateResult> {
		return await this.repository.update(id, data);
	}

	public async delete(id: string): Promise<DeleteResult> {
		return await this.repository.delete(id);
	}
}
