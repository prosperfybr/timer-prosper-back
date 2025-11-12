import { In, Repository, UpdateResult } from "typeorm";
import { AppDataSource } from "../../../ormconfig";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";
import { CollaboratorsServicesEntity } from "./collaborator-services.entity";

@RepositoryDec()
export class CollaboratorServicesRepository {
  private repository: Repository<CollaboratorsServicesEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(CollaboratorsServicesEntity);
  }

  public async save(service: CollaboratorsServicesEntity): Promise<CollaboratorsServicesEntity> {
    return await this.repository.save(service);
  }

  public async saveAll(relationships: CollaboratorsServicesEntity[]): Promise<CollaboratorsServicesEntity[]> {
    return await this.repository.save(relationships);
  }

  public async update(id: string, data: Partial<CollaboratorsServicesEntity>): Promise<UpdateResult> {
    return await this.repository.update(id, data);
  }

  public async findAllServicesByCollaboratorId(id: string): Promise<CollaboratorsServicesEntity[]> {
    return await this.repository.find({ where: { collaboratorId: id }});
  }

  public async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  public async syncRelationship(collaboratorId: string, addedIds: string[], removedIds: string[]): Promise<void> {
    if (addedIds.length === 0 && removedIds.length === 0) {
      return;
    }

    await this.repository.manager.transaction(async transactionEntityManager => {
      if (removedIds.length > 0) {
        await transactionEntityManager.delete(CollaboratorsServicesEntity, {
          collaboratorId,
          serviceId: In(removedIds)
        });
      }

      if (addedIds.length > 0) {
        const newRelationships = addedIds.map(id => {
          transactionEntityManager.create(CollaboratorsServicesEntity, {
            collaboratorId,
            serviceId: id
          });
        });

        await transactionEntityManager.save(newRelationships);
      }
    });
  }
}