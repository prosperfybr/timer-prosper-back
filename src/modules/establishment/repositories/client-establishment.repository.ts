import { log } from "@config/Logger";
import { AppDataSource } from "@config/ormconfig";
import { ClientEstablishmentEntity } from "@modules/establishment/models/entity/client-establishment.entity";
import { UserEntity } from "@modules/users/models/entity/user.entity";
import { validate as validateUUID } from "uuid";
import { EstablishmentEntity } from "../models/entity/establishment.entity";

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
	async findInviteByClientAndEstablishment(
		clientIdentifier: string,
		establishmentIdentifier: string,
	): Promise<{
		client: UserEntity;
		owner: UserEntity;
		establishment: EstablishmentEntity;
		invite: ClientEstablishmentEntity;
	}> {
		log.info(`Searching an invite by params [client: ${clientIdentifier} | establishment: ${establishmentIdentifier}]`);
		const sql: string = `
		SELECT
				${validateUUID(clientIdentifier) ? "row_to_json(client) as client" : "client as client"},
				${validateUUID(clientIdentifier) ? "row_to_json(establishment) as establishment" : "establishment as establishment"},
				${validateUUID(clientIdentifier) ? "row_to_json(invite) as invite" : "invite as invite"},
				${validateUUID(clientIdentifier) ? "row_to_json(owner) as owner" : "owner as onwer"}
		FROM establishments as establishment
				INNER JOIN users as owner ON owner.id = establishment.user_id
				LEFT JOIN users client ON ${validateUUID(clientIdentifier) ? "client.id = '" + clientIdentifier + "'" : "client.email = '" + clientIdentifier + "'"}
				LEFT JOIN client_establishments invite ON invite.user_id = client.id
		WHERE ${
			validateUUID(establishmentIdentifier)
				? "establishment.id = '" + establishmentIdentifier + "'"
				: "establishment.id = (SELECT id from establishments where code = '%" + establishmentIdentifier + "%')"
		};`;

		const result = await this.query(sql);
		log.info("Invite consulted successfully");
		return result[0];
	},
});
