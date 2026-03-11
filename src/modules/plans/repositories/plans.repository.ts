import { AppDataSource } from "@config/ormconfig";
import { PlansEntity } from "../models/entity/plans.entity";

export const PlansRepository = AppDataSource.getRepository(PlansEntity).extend({
	async findAll(): Promise<PlansEntity[]> {
		return await this.find({ where: { active: true }, order: { monthlyPrice: "ASC" } });
	},

	async findById(id: string): Promise<PlansEntity> {
		return await this.findOne({ where: { id } });
	},
});
