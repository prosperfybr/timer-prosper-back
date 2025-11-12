import { DeleteResult, Repository } from "typeorm";

import { AppDataSource } from "../../../ormconfig";
import { EstablishmentEntity } from "./establishment.entity";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";

@RepositoryDec()
export class EstablishmentRepository {
	private repository: Repository<EstablishmentEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(EstablishmentEntity);
	}

	public async save(establishment: EstablishmentEntity): Promise<EstablishmentEntity> {
		return await this.repository.save(establishment);
	}

	public async findById(id: string): Promise<EstablishmentEntity> {
		const establishment = await this.repository.findOne({
			where: { id },
			relations: ["user", "services", 'segment'],
			order: {
				services: { name: "ASC" },
			},
		});

		return establishment;
	}

	public async findAll(): Promise<EstablishmentEntity[]> {
		return await this.repository.find();
	}

	public async findAllByUser(userId: string): Promise<EstablishmentEntity[]> {
		return await this.repository.find({ where: { userId } });
	}

	public async delete(id: string): Promise<DeleteResult> {
		return await this.repository.delete(id);
	}

	public async update(id: string, fieldsToUpdate: Partial<EstablishmentEntity>) {
		return await this.repository.update(id, fieldsToUpdate);
	}

	public async findBySegment(segmentId: string): Promise<EstablishmentEntity[]> {
		return await this.repository.find({ where: { segmentId }, relations: ['user', 'segment']});
	}

	public async findOneByIdentifier(identifier: string): Promise<EstablishmentEntity> {
		let isUUID: boolean = identifier.includes("-");

		if (isUUID) {
			return await this.findById(identifier);
		} else {
			const searchParam: string = `%${identifier.trim()}%`;
	
			const establishment: EstablishmentEntity = await this.repository.createQueryBuilder('establishment')
				.where(`establishment.id = :searchParam`, { searchParam })
				.orWhere(`establishment.code ILIKE :searchParam`, { searchParam }) //- Find by code
				.orWhere(`establishment.tradeName ILIKE :searchParam`, { searchParam }) //- Find by Name
				.orWhere(`establishment.mainPhone ILIKE :searchParam`, { searchParam }) //- Find by telephone
				.leftJoinAndSelect('establishment.user', 'user')
				.orWhere('user.email ILIKE :searchParam', { searchParam }) //- Find by owner email
				.getOne();
	
			return establishment;
		}
	}

	public async findAllByIdentifier(identifier: string): Promise<EstablishmentEntity[]> {
		const searchParam: string = `%${identifier.trim()}%`;

		const establishments: EstablishmentEntity[] = await this.repository.createQueryBuilder('establishment')
			.leftJoinAndSelect('establishment.user', 'user')
			.andWhere(`establishment.code ILIKE :searchParam OR establishment.tradeName ILIKE :searchParam`, { searchParam })
			.orderBy('establishment.tradeName', 'ASC')
			.getMany();

		return establishments;
	}
}
