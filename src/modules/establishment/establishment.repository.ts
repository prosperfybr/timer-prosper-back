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
			relations: ["user", "services"],
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
}
