import { log } from "@config/Logger";
import { ClientEstablishmentResponseDTO } from "@modules/establishment/models/dto/establishment/client-establishment-response.dto";
import { ClientEstablishmentEntity } from "@modules/establishment/models/entity/client-establishment.entity";
import { ClientEstablishmentRepository } from "@modules/establishment/repositories/client-establishment.repository";
import { Track } from "@shared/decorators/logs/track.decorator";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { validate as validateUUID } from 'uuid';

@Service()
export class FindClientEstablishmentService {
	constructor(private readonly formatterUtils: FormatterUtils) {}

	@Track()
	public async findClientsEstablishment(establishmentId: string): Promise<ClientEstablishmentResponseDTO[]> {
		log.info("Starting search for establishment clients");
		if (!establishmentId || !validateUUID(establishmentId)) {
			log.error(`Establishment ID is required, but is received [${establishmentId}]`);
			throw new BadRequestException("O ID do estabelecimento é obrigatório");
		}

		const clients: ClientEstablishmentEntity[] = await ClientEstablishmentRepository.findAllByEstablishment(establishmentId);

		if (!clients || clients.length === 0) {
			log.warn("No clients found to establshment");
			return [];
		} else {
			log.info("Clients founded");
			const clientsFormatted: ClientEstablishmentResponseDTO[] = [];

			for (const client of clients) {
				clientsFormatted.push({
					id: client.id,
					clientEmail: client.clientEmail,
					userId: client.userId,
					user: client.user ? {
						id: client.user.id,
						name: client.user.name,
						email: client.user.email,
						role: client.user.role,
						birthDate: client.user.birthDate,
						whatsApp: client.user.whatsApp,
						cpf: client.user.cpf ? this.formatterUtils.addCPFMask(client.user.cpf) : null,
						profileComplete: client.user.profileComplete,
						profilePreferences: client.user.profilePreferences,
						settingsPreferences: null,
						establsihmentId: null,
						establishments: null
					} : null,
					establishmentId: client.establishmentId,
					establishment: {
						id: client.establishment.id,
						userId: client.establishment.userId,
						segmentId: client.establishment.segmentId,
						code: client.establishment.code,
						tradeName: client.establishment.tradeName,
						logo: client.establishment.logo,
						logoDark: client.establishment.logoDark,
						zipCode: client.establishment.zipCode,
						street: client.establishment.street,
						number: client.establishment.number,
						complement: client.establishment.complement,
						neighborhood: client.establishment.neighborhood,
						city: client.establishment.city,
						state: client.establishment.state,
						mainPhone: client.establishment.mainPhone,
						website: client.establishment.website,
						instagram: client.establishment.instagram,
						linkedin: client.establishment.linkedin,
						tiktok: client.establishment.tiktok,
						youtube: client.establishment.youtube,
						createdAt: client.establishment.createdAt,
						updatedAt: client.establishment.updatedAt,
						user: null,
						services: null,
						segment: null,
					},
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

	@Track()
	public async findEstablishmentsClient(clientId: string): Promise<ClientEstablishmentResponseDTO[]> {
		log.info("Starting search for client establishments");
		if (!clientId) {
			log.error(`Client ID is required, but is received [${clientId}]`);
			throw new BadRequestException("O ID do cliente é obrigatório");
		}

		const clientEstablishments: ClientEstablishmentEntity[] = await ClientEstablishmentRepository.findAllByUser(clientId);
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
