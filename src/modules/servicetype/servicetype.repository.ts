import { Repository } from "typeorm";
import { ServiceTypeEntity } from "./servicetype.entity";
import { AppDataSource } from "../../../ormconfig";

export class ServiceTypeRepository {
  private repository: Repository<ServiceTypeEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ServiceTypeEntity);
  }
}