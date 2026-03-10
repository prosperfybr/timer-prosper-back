import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";
import { EntityManager, In, Repository, UpdateResult } from "typeorm";
import { AppDataSource } from "../../../config/ormconfig";
import { CollaboratorsServicesEntity } from "../models/entity/collaborator-services.entity";

export const CollaboratorServicesRepository = AppDataSource.getRepository(CollaboratorsServicesEntity).extend({
	async findAllServicesByCollaboratorId(id: string): Promise<CollaboratorsServicesEntity[]> {
		return await this.find({ where: { collaboratorId: id } });
	},
	async syncRelationship(collaboratorId: string, addedIds: string[], removedIds: string[]): Promise<void> {
		if (addedIds.length === 0 && removedIds.length === 0) {
			return;
		}

		await this.manager.transaction(async (transactionEntityManager: EntityManager) => {
			if (removedIds.length > 0) {
				await transactionEntityManager.delete(CollaboratorsServicesEntity, {
					collaboratorId,
					serviceId: In(removedIds),
				});
			}

			if (addedIds.length > 0) {
				const newRelationships = addedIds.map((id) => {
					return transactionEntityManager.create(CollaboratorsServicesEntity, {
						collaboratorId,
						serviceId: id,
					});
				});

				await transactionEntityManager.save(newRelationships);
			}
		});
	},
});
