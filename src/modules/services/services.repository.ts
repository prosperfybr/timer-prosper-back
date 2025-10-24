import { Repository, UpdateResult } from "typeorm";
import { AppDataSource } from "../../../ormconfig";
import { ServicesEntity } from "./services.entity";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";

@RepositoryDec()
export class ServicesRepository {
  private repository: Repository<ServicesEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ServicesEntity);
  }

  public async save(service: ServicesEntity): Promise<ServicesEntity> {
    return await this.repository.save(service);
  }

  public async update(id: string, data: Partial<ServicesEntity>): Promise<UpdateResult> {
    return await this.repository.update(id, data);
  }

  public async findById(id: string): Promise<ServicesEntity> {
    return await this.repository.findOne({ where: { id }, relations: ['serviceType', 'establishment'] });
  }

  public async findAndCount(whereClause: any, limit: number, skip: number): Promise<[ServicesEntity[], number]> {
    return await this.repository.findAndCount({
      where: whereClause,
      take: limit,
      skip,
      relations: ['establishment', 'serviceType'],
      order: { name: 'ASC' }
    });
  }

  public async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}