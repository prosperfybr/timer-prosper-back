import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";
import { Repository } from "typeorm";
import { AppDataSource } from "../../../../ormconfig";
import { RefreshTokenEntity } from "../models/entity/refresh-token.entity";

@RepositoryDec()
export class RefreshTokenRepository {
	private repository: Repository<RefreshTokenEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(RefreshTokenEntity);
	}

	public async save(user: RefreshTokenEntity): Promise<RefreshTokenEntity> {
		return await this.repository.save(user);
	}

	public async findByTokenHash(hash: string): Promise<RefreshTokenEntity> {
		return await this.repository.findOne({ where: { tokenHash: hash }, relations: ["user"] });
	}
}
