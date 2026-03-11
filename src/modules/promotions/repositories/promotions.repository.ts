import { AppDataSource } from "@config/ormconfig";
import { PromotionsEntity } from "../models/entity/promotions.entity";

export const PromotionsRepository = AppDataSource.getRepository(PromotionsEntity).extend({
	async findByEstablishment(establishmentId: string): Promise<PromotionsEntity[]> {
		return await this.find({
			where: { establishmentId },
			relations: ["services"],
			order: { startsAt: "DESC" },
		});
	},

	async findActiveByEstablishment(establishmentId: string): Promise<PromotionsEntity[]> {
		const now = new Date();
		return await this.createQueryBuilder("promotion")
			.leftJoinAndSelect("promotion.services", "service")
			.where("promotion.establishment_id = :establishmentId", { establishmentId })
			.andWhere("promotion.active = true")
			.andWhere("promotion.starts_at <= :now", { now })
			.andWhere("promotion.ends_at >= :now", { now })
			.getMany();
	},

	async findById(id: string): Promise<PromotionsEntity> {
		return await this.findOne({ where: { id }, relations: ["services"] });
	},
});
