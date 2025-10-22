import { Repository } from "typeorm";
import { AppDataSource } from "../../../ormconfig";
import { UserEntity } from "./user.entity";

export class UserRepostory {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  public async save(user: UserEntity): Promise<void> {}
}