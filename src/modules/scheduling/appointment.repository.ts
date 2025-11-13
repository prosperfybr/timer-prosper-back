import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { AppDataSource } from "../../../ormconfig";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";
import { AppointmentEntity } from "./appointment.entity";

@RepositoryDec()
export class AppointmentRepository {
	private repository: Repository<AppointmentEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(AppointmentEntity);
	}

	public async save(serviceType: AppointmentEntity): Promise<AppointmentEntity> {
		return await this.repository.save(serviceType);
	}

	public async findById(id: string): Promise<AppointmentEntity> {
		return await this.repository.findOne({ where: { id }, relations: ['serviceTypes'] });
	}

	public async findAll(): Promise<AppointmentEntity[]> {
		return await this.repository.find();
	}

	public async update(id: string, data: Partial<AppointmentEntity>): Promise<UpdateResult> {
		return await this.repository.update(id, data);
	}

	public async delete(id: string): Promise<DeleteResult> {
		return await this.repository.delete(id);
	}
}
