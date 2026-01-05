import { AppDataSource } from "@config/ormconfig";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { UserEntity } from "../models/entity/user.entity";

export const UserRepository = AppDataSource.getRepository(UserEntity).extend({
	async findById(id: string): Promise<UserEntity> {
		return await this.findOne({ where: { id }, relations: ["establishments"] });
	},
	async findByEmail(email: string): Promise<UserEntity> {
		return await this.findOne({ where: { email } });
	},
	async findUserNameByUserId(userId: string): Promise<Pick<UserEntity, "name">> {
		const user = await this.createQueryBuilder("user").select(["user.name"]).where("user.id = :userId", { userId }).getOne();
		return user as Pick<UserEntity, "name">;
	},
	async findUserEstablishments(id: string): Promise<EstablishmentEntity[]> {
		const userWithEstablishments: UserEntity = await this.findOne({
			where: { id },
			relations: ["establishments"],
			order: { establishments: { tradeName: "ASC" } },
		});

		if (!userWithEstablishments) return [];
		return userWithEstablishments.establishments;
	},
	async getUserDetails(userId: string): Promise<any> {
		const result = await this.createQueryBuilder("user")
			.where("user.id = :userId", { userId })
			.innerJoinAndSelect("user.establishments", "establishments")
			.leftJoinAndSelect("user.preferences", "preferences")
			.getOne();

		return result;
	},
});
