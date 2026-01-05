import { AppDataSource } from "@config/ormconfig";
import { ClientEstablishmentEntity } from "@modules/establishment/models/entity/client-establishment.entity";

export const ClientEstablishmentRepository = AppDataSource.getRepository(ClientEstablishmentEntity).extend({
	async findById(id: string): Promise<ClientEstablishmentEntity> {
		const client = await this.findOne({
			where: { id },
			relations: ["user", "establishment"],
		});

		return client;
	},
	async findAllByEstablishment(establishmentId: string): Promise<ClientEstablishmentEntity[]> {
		return await this.find({ where: { establishmentId }, relations: ["establishment", "user"] });
	},
	async findAllByUser(userId: string): Promise<ClientEstablishmentEntity[]> {
		return await this.find({ where: { userId } });
	},
	async findByUserId(userId: string): Promise<ClientEstablishmentEntity> {
		return await this.findOne({ where: { userId } });
	},
});
