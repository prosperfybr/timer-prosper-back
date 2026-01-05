import { AppDataSource } from "@config/ormconfig";
import { EstablishmentEntity } from "../models/entity/establishment.entity";

export const EstablishmentRepository = AppDataSource.getRepository(EstablishmentEntity).extend({
	async findById(id: string): Promise<EstablishmentEntity> {
		const establishment = await this.findOne({
			where: { id },
			relations: ["user", "services", "segment"],
			order: {
				services: { name: "ASC" },
			},
		});

		return establishment;
	},
	async findAllByUser(userId: string): Promise<EstablishmentEntity[]> {
		return await this.find({ where: { userId } });
	},
	async findByOwnerOrCollaborator(userId: string): Promise<EstablishmentEntity> {
		const establishment: EstablishmentEntity = await this.createQueryBuilder("establishment")
			.leftJoin("establishment.collaborators", "collaborator")
			.where("establishment.userId = :id", { id: userId })
			.orWhere("collaborator.userId = :id", { id: userId })
			.leftJoinAndSelect("establishment.user", "owner")
			.leftJoinAndSelect("establishment.segment", "segment")
			.getOne();

		return establishment;
	},
	async findBySegment(segmentId: string): Promise<EstablishmentEntity[]> {
		return await this.find({ where: { segmentId }, relations: ["user", "segment"] });
	},
	async findOneByIdentifier(identifier: string): Promise<EstablishmentEntity> {
		let isUUID: boolean = identifier.includes("-");
		if (isUUID) return await this.findById(identifier);
		else {
			const searchParam: string = `%${identifier.trim()}%`;

			const establishment: EstablishmentEntity = await this.createQueryBuilder("establishment")
				.where(`establishment.id = :searchParam`, { searchParam })
				.orWhere(`establishment.code ILIKE :searchParam`, { searchParam }) //- Find by code
				.orWhere(`establishment.tradeName ILIKE :searchParam`, { searchParam }) //- Find by Name
				.orWhere(`establishment.mainPhone ILIKE :searchParam`, { searchParam }) //- Find by telephone
				.leftJoinAndSelect("establishment.user", "user")
				.orWhere("user.email ILIKE :searchParam", { searchParam }) //- Find by owner email
				.getOne();

			return establishment;
		}
	},
	async findAllByIdentifier(identifier: string): Promise<EstablishmentEntity[]> {
		const searchParam: string = `%${identifier.trim()}%`;

		const establishments: EstablishmentEntity[] = await this.createQueryBuilder("establishment")
			.leftJoinAndSelect("establishment.user", "user")
			.andWhere(`establishment.code ILIKE :searchParam OR establishment.tradeName ILIKE :searchParam`, { searchParam })
			.orderBy("establishment.tradeName", "ASC")
			.getMany();

		return establishments;
	},
});
