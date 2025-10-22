import { Repository } from "typeorm";
import { AppDataSource } from "../../../ormconfig";
import { ServicesEntity } from "./services.entity";

export class ServicesRepository {
  private repository: Repository<ServicesEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ServicesEntity);
  }
}