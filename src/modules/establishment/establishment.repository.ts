import { Repository } from "typeorm";

import { AppDataSource } from "../../../ormconfig";
import { EstablishmentEntity } from "./establishment.entity";

export class EstablishmentRepository {
  private repository: Repository<EstablishmentEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(EstablishmentEntity);
  }
}