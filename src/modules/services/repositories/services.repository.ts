import { AppDataSource } from "@config/ormconfig";
import { In } from "typeorm";
import { ServicesEntity } from "../models/entity/services.entity";

export const ServicesRepository = AppDataSource.getRepository(ServicesEntity).extend({
	async findById(id: string): Promise<ServicesEntity> {
		return await this.findOne({ where: { id }, relations: ["serviceType", "establishment"] });
	},
	async findByIds(ids: string[]): Promise<ServicesEntity[]> {
		const services = await this.find({
			where: { id: In(ids) },
			relations: ["establishment", "serviceType"],
		});

		return services;
	},
});
