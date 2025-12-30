import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";
import { Repository, UpdateResult } from "typeorm";
import { AppDataSource } from "../../../config/ormconfig";
import { CollaboratorEntity } from "../models/entity/collaborator.entity";
import { CollaboratorsServicesEntity } from "../models/entity/collaborator-services.entity";
import { ServicesEntity } from "@modules/services/models/entity/services.entity";
import { log } from "@config/Logger";

@RepositoryDec()
export class CollaboratorRepository {
	private repository: Repository<CollaboratorEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(CollaboratorEntity);
	}

	public async save(user: CollaboratorEntity): Promise<CollaboratorEntity> {
		return await this.repository.save(user);
	}

	public async findById(id: string): Promise<CollaboratorEntity> {
		return await this.repository.findOne({ where: { id }, relations: ["user", "establishment"] });
	}

	public async findAll(): Promise<CollaboratorEntity[]> {
		return await this.repository.find();
	}

	public async findAllByEstablishmentId(establishmentId: string): Promise<CollaboratorEntity[]> {
		return await this.repository.find({ where: { establishmentId } });
	}

	public async findCollaboratorsInEstablishentWorksInService(establishmentId: string, serviceId: string, collaboratorId: string): Promise<CollaboratorEntity[]> {
		let queryCollaborators = this.repository.createQueryBuilder("collaborator")
		.where('collaborator.establishmentId = :establishmentId', { establishmentId })
		.andWhere('collaborator.active = :isActive', { isActive: true })
		.innerJoinAndSelect("collaborators_services", "serviceLink", 'serviceLink.serviceId = :serviceId', { serviceId });

		if (collaboratorId !== null && collaboratorId !== undefined) 
			queryCollaborators = queryCollaborators.andWhere("collaborator.id = :id", { id: collaboratorId});

		return await queryCollaborators.getMany();
	}

	public async findByUserId(userId: string): Promise<CollaboratorEntity> {
		return await this.repository.findOne({ where: { userId } });
	}

	public async update(id: string, data: Partial<CollaboratorEntity>): Promise<UpdateResult> {
		return await this.repository.update(id, data);
	}

	public async delete(id: string): Promise<void> {
		await this.repository.delete(id);
	}

	public async findCollaboratorInformations(collaboratorId: string): Promise<any> {
		log.info(`Finding all informations for collaborator [${collaboratorId}`);
		const result =
			await this.repository.createQueryBuilder("collaborator")
			.where('collaborator.id = :collaboratorId', { collaboratorId })
			.innerJoinAndSelect("collaborator.user", "user")
			.innerJoinAndSelect("collaborator.establishment", "establishment")
			.innerJoinAndSelect("collaborators_services", "collabServices", "collabServices.collaboratorId = collaborator.id")
			.innerJoinAndSelect("services", "service", "service.id = collabServices.serviceId")
			.getRawMany();
		log.info("All informations for collaborator consulted");
		return result.length > 0 ? result : [];
	}

	public async findEstablishmentCollaborators(establishmentId: string): Promise<any> {
		log.info("Finding all collaborators for establishment");
		const result =
			await this.repository.createQueryBuilder("collaborator")
			.where("collaborator.establishment_id = :establishmentId", { establishmentId})
			.innerJoinAndSelect("collaborator.user", "user")
			.innerJoinAndSelect("collaborator.establishment", "establishment")
			.innerJoinAndSelect("collaborators_services", "collabServices", "collabServices.collaboratorId = collaborator.id")
			.innerJoinAndSelect("services", "service", "service.id = collabServices.serviceId")
			.getRawMany();
		log.info("All collaborators for establishment consulted");
		return result.length > 0 ? result : [];
	}
}
