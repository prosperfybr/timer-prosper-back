
import { AppDataSource } from "@config/ormconfig";
import { EstablishmentHourEntity } from "../models/entity/establishment-hour.entity";

export const EstablishmentHourRepository = AppDataSource.getRepository(EstablishmentHourEntity).extend({
	async findById(id: string): Promise<EstablishmentHourEntity> {
		const establishment = await this.findOne({
			where: { id },
			relations: ["establishment"],
		});
		return establishment;
	},
	async findAllByEstablishment(establishmentId: string): Promise<EstablishmentHourEntity[]> {
		return await this.find({ where: { establishmentId }, relations: ["establishment"] });
	},
	async findByEstablishmentAndWeekDay(establishmentId: string, dayOfWeek: number): Promise<EstablishmentHourEntity> {
		return await this.findOne({ where: { establishmentId, dayOfWeek }, relations: ["establishment"]});
	}
});
