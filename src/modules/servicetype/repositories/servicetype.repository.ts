import { AppDataSource } from "@config/ormconfig";
import { ServiceTypeEntity } from "../models/entity/servicetype.entity";

export const ServiceTypeRepository = AppDataSource.getRepository(ServiceTypeEntity).extend({
	async findById(id: string): Promise<ServiceTypeEntity> {
		return await this.findOne({ where: { id }, relations: ["services", "segment"] });
	},
	async findAll(): Promise<ServiceTypeEntity[]> {
		return await this.find({ relations: ["segment"] });
	},
	async findByEstablishment(establishmentId: string): Promise<ServiceTypeEntity[]> {
		const query = this.createQueryBuilder("serviceType")
			.innerJoin("serviceType.services", "service", "service.establishmentId = :establishmentId", { establishmentId })
			.select(["serviceType.id", "serviceType.name", "serviceType.description", "serviceType.createdAt", "serviceType.updatedAt"])
			.distinct(true)
			.orderBy("serviceType.name", "ASC");
		return await query.getMany();
	},
	async findBySegment(segmentId: string): Promise<ServiceTypeEntity[]> {
		return await this.find({ where: { segmentId }, relations: ["services", "segment"] });
	},
});
