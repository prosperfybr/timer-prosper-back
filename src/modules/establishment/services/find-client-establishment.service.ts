import { log } from "@config/Logger";
import { ClientEstablishmentResponseDTO } from "@modules/establishment/models/dto/establishment/client-establishment-response.dto";
import { ClientEstablishmentEntity } from "@modules/establishment/models/entity/client-establishment.entity";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { ClientEstablishmentRepository } from "@modules/establishment/repositories/client-establishment.repository";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";
import { UserResponseDTO } from "@modules/users/models/dto/user-response.dto";
import { UserEntity } from "@modules/users/models/entity/user.entity";
import { UserRepository } from "@modules/users/repositories/users.repository";
import { FindUserService } from "@modules/users/services/find-user.service";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { EstablishmentResponseDTO } from "../models/dto/establishment/establishment-response.dto";
import { FindEstablishmentService } from "./find-establishment.service";

@Service()
export class FindClientEstablishmentService {
	constructor(
		private readonly establishmentRepository: EstablishmentRepository,
		private readonly clientEstablishmentRepository: ClientEstablishmentRepository,
		private readonly userRepository: UserRepository,

		private readonly findUserService: FindUserService,
		private readonly findEstablishmentService: FindEstablishmentService
	) {}

	public async findClientsEstablishment(establishementId: string): Promise<ClientEstablishmentResponseDTO[]> {
		log.info("Starting search for establishment clients");
		if (!establishementId) {
			log.error(`Establishment ID is required, but is received [${establishementId}]`);
			throw new BadRequestException("O ID do estabelecimento é obrigatório");
		}
		const establishment: EstablishmentEntity = await this.establishmentRepository.findById(establishementId);
		if (!establishment) {
			log.error(`Establishment not found by ID [${establishementId}]`);
			throw new BadRequestException("Estabelecimento não encontrado");
		}

		const clients: ClientEstablishmentEntity[] = await this.clientEstablishmentRepository.findAllByEstablishment(establishment.id);

		if (!clients || clients.length === 0) {
			log.warn("No clients found to establshment");
			return [];
		} else {
			log.info("Clients founded");
			const clientsFormatted: ClientEstablishmentResponseDTO[] = [];
			const establishment: EstablishmentResponseDTO = await this.findEstablishmentService.findById(clients[0].establishmentId);

			for (const client of clients) {
				const user: UserResponseDTO = await this.findUserService.getUser(client.userId);
				clientsFormatted.push({
					id: client.id,
					userId: client.userId,
					user,
					establishmentId: client.establishmentId,
					establishment,
					status: client.status,
					requestedBy: client.requestedBy,
					requestedAt: client.requestedAt,
					approvedAt: client.approvedAt,
					rejectedAt: client.rejectedAt,
					createdAt: client.createdAt,
				} as ClientEstablishmentResponseDTO);
			}

			return clientsFormatted;
		}
	}

	public async findEstablishmentsClient(clientId: string): Promise<ClientEstablishmentResponseDTO[]> {
		log.info("Starting search for client establishments");
		if (!clientId) {
			log.error(`Client ID is required, but is received [${clientId}]`);
			throw new BadRequestException("O ID do cliente é obrigatório");
		}

		const client: UserEntity = await this.userRepository.findById(clientId);
		if (!client) {
			log.error(`Client not found by ID [${clientId}]`);
			throw new BadRequestException("Cliente não encontrado");
		}

		const clientEstablishments: ClientEstablishmentEntity[] = await this.clientEstablishmentRepository.findAllByUser(client.id);
		if (!clientEstablishments || clientEstablishments.length === 0) {
			log.warn("No establishments found to client");
			return [];
		} else {
			log.info("Establishments founded");
			return clientEstablishments.map(clientEstablishment => ({
				id: clientEstablishment.id,
				userId: clientEstablishment.userId,
				establishmentId: clientEstablishment.establishmentId,
				status: clientEstablishment.status,
				requestedBy: clientEstablishment.requestedBy,
				requestedAt: clientEstablishment.requestedAt,
				approvedAt: clientEstablishment.approvedAt,
				rejectedAt: clientEstablishment.rejectedAt,
				createdAt: clientEstablishment.createdAt,
			}));
		}
	}
}
