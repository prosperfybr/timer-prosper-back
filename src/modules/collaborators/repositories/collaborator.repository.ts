import { log } from "@config/Logger";
import { AppDataSource } from "@config/ormconfig";
import { CollaboratorEntity } from "../models/entity/collaborator.entity";

export const CollaboratorRepository = AppDataSource.getRepository(CollaboratorEntity).extend({
	async findAllByEstablishmentId(establishmentId: string): Promise<CollaboratorEntity[]> {
		return await this.find({ where: { establishmentId } });
	},
	async findCollaboratorsInEstablishentWorksInService(
		establishmentId: string,
		serviceId: string,
		collaboratorId: string,
	): Promise<CollaboratorEntity[]> {
		let queryCollaborators = this.createQueryBuilder("collaborator")
			.where("collaborator.establishmentId = :establishmentId", { establishmentId })
			.andWhere("collaborator.active = :isActive", { isActive: true })
			.innerJoinAndSelect("collaborators_services", "serviceLink", "serviceLink.serviceId = :serviceId", { serviceId });

		if (collaboratorId !== null && collaboratorId !== undefined)
			queryCollaborators = queryCollaborators.andWhere("collaborator.id = :id", { id: collaboratorId });

		return await queryCollaborators.getMany();
	},
	async findByUserId(userId: string): Promise<CollaboratorEntity> {
		return await this.findOne({ where: { userId } });
	},
	async findCollaboratorInformations(collaboratorId: string): Promise<any> {
		log.info(`Finding all informations for collaborator [${collaboratorId}`);
		const result = await this.createQueryBuilder("collaborator")
			.where("collaborator.id = :collaboratorId", { collaboratorId })
			.innerJoinAndSelect("collaborator.user", "user")
			.innerJoinAndSelect("collaborator.establishment", "establishment")
			.innerJoinAndSelect("collaborators_services", "collabServices", "collabServices.collaboratorId = collaborator.id")
			.innerJoinAndSelect("services", "service", "service.id = collabServices.serviceId")
			.getRawMany();
		log.info("All informations for collaborator consulted");
		return result.length > 0 ? result : [];
	},
	async findEstablishmentCollaborators(establishmentId: string): Promise<any> {
		log.info("Finding all collaborators for establishment");
		const result = await this.createQueryBuilder("collaborator")
			.where("collaborator.establishment_id = :establishmentId", { establishmentId })
			.innerJoinAndSelect("collaborator.user", "user")
			.innerJoinAndSelect("collaborator.establishment", "establishment")
			.innerJoinAndSelect("collaborators_services", "collabServices", "collabServices.collaboratorId = collaborator.id")
			.innerJoinAndSelect("services", "service", "service.id = collabServices.serviceId")
			.getRawMany();
		log.info("All collaborators for establishment consulted");
		return result.length > 0 ? result : [];
	},
});
