import { AppDataSource } from "@config/ormconfig";
import { SegmentEntity } from "../models/entity/segment.entity";

export const SegmentRepository = AppDataSource.getRepository(SegmentEntity).extend({
	async findById(id: string): Promise<SegmentEntity> {
		return await this.findOne({ where: { id }, relations: ["serviceTypes"] });
	},
	async findAll(): Promise<SegmentEntity[]> {
		return await this.find();
	},
	async findAllActive(): Promise<SegmentEntity[]> {
		return await this.find({ where: { isActive: true } });
	},
});
