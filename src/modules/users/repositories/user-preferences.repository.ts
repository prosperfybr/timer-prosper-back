import { AppDataSource } from "@config/ormconfig";
import { UserPreferencesEntity } from "../models/entity/user-preferences.entity";

export const UserPreferencesRepository = AppDataSource.getRepository(UserPreferencesEntity).extend({
	async findByUserId(userId: string): Promise<UserPreferencesEntity> {
		return await this.findOne({ where: { userId } });
	},
	async findById(id: string): Promise<UserPreferencesEntity> {
		return await this.findOne({ where: { id } });
	},
});
