import { AppDataSource } from "@config/ormconfig";
import { RefreshTokenEntity } from "../models/entity/refresh-token.entity";

export const RefreshTokenRepository = AppDataSource.getRepository(RefreshTokenEntity).extend({
	async findByTokenHash(hash: string): Promise<RefreshTokenEntity> {
		return await this.findOne({ where: { tokenHash: hash }, relations: ["user"] });
	},
});
