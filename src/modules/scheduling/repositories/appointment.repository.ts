import { DeleteResult, In, LessThan, MoreThan, Repository, UpdateResult } from "typeorm";
import { AppDataSource } from "../../../config/ormconfig";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";
import { AppointmentEntity } from '../models/entity/appointment.entity';
import { AppointmentStatusEnum } from "../models/enums/appointment-status.enum";

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

	public async findAllByCollaboratorIdAndDate(collaboratorId: string, startTime: Date, endTime: Date): Promise<AppointmentEntity[]> {
		return await this.repository.find({
			where: {
				collaboratorId,
				status: In([AppointmentStatusEnum.PENDING, AppointmentStatusEnum.CONFIRMED]),
				endTime: MoreThan(startTime),
				startTime: LessThan(endTime)
			}
		});
	}

	public async findAllByCollaboratorsIdAndDate(collaboratorIds: string[], startTime: Date, endTime: Date): Promise<AppointmentEntity[]> {
		return await this.repository.find({
			where: {
				collaboratorId: In(collaboratorIds),
				status: In([AppointmentStatusEnum.PENDING, AppointmentStatusEnum.CONFIRMED]),
				endTime: MoreThan(startTime),
				startTime: LessThan(endTime)
			}
		});
	}

	public async findAllByIdentifierClient(id: string): Promise<AppointmentEntity[]> {
		let querySchedulers = this.repository.createQueryBuilder("appointment")
		.where('appointment.clientId = :id', { id })
		.orWhere('appointment.serviceId = :id', { id })
		.orWhere('appointment.collaboratorId = :id', { id });

		return querySchedulers.getMany();
	}

	public async findAllByEstablishmentCollaborators(collaboratorsIds: string[]): Promise<AppointmentEntity[]> {
		return await this.repository.find({
			where: {
				collaboratorId: In(collaboratorsIds)
			}
		});
	}

	public async update(id: string, data: Partial<AppointmentEntity>): Promise<UpdateResult> {
		return await this.repository.update(id, data);
	}

	public async delete(id: string): Promise<DeleteResult> {
		return await this.repository.delete(id);
	}
}
