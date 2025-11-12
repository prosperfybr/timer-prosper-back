import { DeleteResult, Repository } from "typeorm";

import { AppDataSource } from "../../../ormconfig";
import { EstablishmentEntity } from "./establishment.entity";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";
import {ClientEstablishmentEntity} from "@modules/establishment/client-establishment.entity";

@RepositoryDec()
export class ClientEstablishmentRepository {
	private repository: Repository<ClientEstablishmentEntity>;

	constructor() {
		this.repository = AppDataSource.getRepository(ClientEstablishmentEntity);
	}

	public async save(establishment: ClientEstablishmentEntity): Promise<ClientEstablishmentEntity> {
		return await this.repository.save(establishment);
	}

	public async findById(id: string): Promise<ClientEstablishmentEntity> {
		const client = await this.repository.findOne({
			where: { id },
			relations: ["user", "establishment"],
		});

		return client;
	}

	public async findAll(): Promise<ClientEstablishmentEntity[]> {
		return await this.repository.find();
	}

	public async findAllByEstablishment(establishmentId: string): Promise<ClientEstablishmentEntity[]> {
		return await this.repository.find({ where: { establishmentId } });
	}
	public async findAllByUser(userId: string): Promise<ClientEstablishmentEntity[]> {
		return await this.repository.find({ where: { userId }});
	}

	public async findByUserId(userId: string): Promise<ClientEstablishmentEntity> {
		return await this.repository.findOne({ where: { userId }});
	}


	public async delete(id: string): Promise<DeleteResult> {
		return await this.repository.delete(id);
	}

	public async update(id: string, fieldsToUpdate: Partial<ClientEstablishmentEntity>) {
		return await this.repository.update(id, fieldsToUpdate);
	}
}
