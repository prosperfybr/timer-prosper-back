import { DeleteResult, Repository } from "typeorm";

import { AppDataSource } from "../../../ormconfig";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";
import { EstablishmentHourEntity } from "./establishment-hour.entity";

@RepositoryDec()
export class EstablishmentHourRepository {
	private repository: Repository<EstablishmentHourEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(EstablishmentHourEntity);
	}

	public async save(establishment: EstablishmentHourEntity): Promise<EstablishmentHourEntity> {
		return await this.repository.save(establishment);
	}

	public async findById(id: string): Promise<EstablishmentHourEntity> {
		const establishment = await this.repository.findOne({
			where: { id },
			relations: ["establishment"],
		});

		return establishment;
	}

	public async findAll(): Promise<EstablishmentHourEntity[]> {
		return await this.repository.find();
	}

	public async findAllByEstablishment(establishmentId: string): Promise<EstablishmentHourEntity[]> {
		return await this.repository.find({ where: { establishmentId } });
	}

	public async delete(id: string): Promise<DeleteResult> {
		return await this.repository.delete(id);
	}

	public async update(id: string, fieldsToUpdate: Partial<EstablishmentHourEntity>) {
		return await this.repository.update(id, fieldsToUpdate);
	}
}
