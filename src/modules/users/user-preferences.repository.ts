import { Repository, UpdateResult } from "typeorm";
import { UserPreferencesEntity } from "./user-preferences.entity";
import { AppDataSource } from "ormconfig";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";

@RepositoryDec()
export class UserPreferencesRepository {
	private repository: Repository<UserPreferencesEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(UserPreferencesEntity);
	}

	public async save(preferences: UserPreferencesEntity): Promise<UserPreferencesEntity> {
		return await this.repository.save(preferences);
	}

	public async findByUserId(userId: string): Promise<UserPreferencesEntity> {
			return await this.repository.findOne({ where: { userId }});
		}
	
		public async findById(id: string): Promise<UserPreferencesEntity> {
			return await this.repository.findOne({ where: { id } });
		}
	
		public async update(id: string, data: Partial<UserPreferencesEntity>): Promise<UpdateResult> {
			return await this.repository.update(id, data);
		}
	
		public async delete(id: string): Promise<void> {
			await this.repository.delete(id);
		}
}
