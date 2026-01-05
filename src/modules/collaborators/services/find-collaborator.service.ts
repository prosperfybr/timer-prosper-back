import { log } from "@config/Logger";
import { EstablishmentResponseDTO } from "@modules/establishment/models/dto/establishment/establishment-response.dto";
import { UserResponseDTO } from "@modules/users/models/dto/user-response.dto";
import { Service } from "@shared/decorators/service.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { validate as validateUUID } from "uuid";
import { CollaboratorResponseDTO } from "../models/dto/collaborator-response.dto";
import { CollaboratorRepository } from "../repositories/collaborator.repository";

@Service()
export class FindCollaboratorService {
	constructor() {}

	public async execute(id: string): Promise<CollaboratorResponseDTO> {
		if (!id || !validateUUID(id)) {
			log.error(`Collaborator ID is required, but is received: [${id}]`);
			throw new InvalidArgumentException("O ID do colaborador é obrigatório");
		}

		const collaboratorInformations: any[] = await CollaboratorRepository.findCollaboratorInformations(id);

		if (!collaboratorInformations || collaboratorInformations.length === 0) {
			log.error("No collaborator informations founded");
			return null;
		} else {
			return this.treatResponse(collaboratorInformations);
		}
	}

	public async getAllEstablishmentCollaborators(establishmentId: string): Promise<CollaboratorResponseDTO[]> {
		if (!establishmentId || !validateUUID(establishmentId)) {
			log.error(`Establishment ID is required and must be a valid UUID, but is received: [${establishmentId}]`);
			throw new InvalidArgumentException("O ID do estabelecimento é obrigatório e deve ser um UUID válido");
		}

		const establishmentCollaborators: any[] = await CollaboratorRepository.findEstablishmentCollaborators(establishmentId);

		if (!establishmentCollaborators || establishmentCollaborators.length === 0) {
			log.warn(`No collaborators found to this establishment`);
			return establishmentCollaborators;
		} else {
			const collaborators: CollaboratorResponseDTO[] = [];
			const collaboratorsGrouped = this.groupCollaborators(establishmentCollaborators);
			collaboratorsGrouped.forEach(collaborator => collaborators.push(this.treatResponse(collaborator)))
			return collaborators;
		}
	}

	private treatResponse(collaboratorInformations: any[]): CollaboratorResponseDTO {
		const servicesIds: string[] = [];
		const services = [];

		collaboratorInformations.forEach(item => {
			servicesIds.push(item.service_id);
			services.push({
				id: item.service_id,
				name: item.service_name,
				description: item.service_description,
				price: item.service_price,
				duration: item.service_duration,
			});
		});

		return {
			id: collaboratorInformations[0].collaborator_id,
			userId: collaboratorInformations[0].collaborator_user_id,
			establishmentId: collaboratorInformations[0].collaborator_establishment_id,
			collaboratorFunction: collaboratorInformations[0].collaborator_collaborator_function,
			specialty: collaboratorInformations[0].collaborator_specialty,
			hiringDate: collaboratorInformations[0].collaborator_hiring_date,
			active: collaboratorInformations[0].collaborator_active,
			createdAt: collaboratorInformations[0].collaborator_created_at,
			updatedAt: collaboratorInformations[0].collaborator_updated_at,
			servicesIds,
			user: {
				id: collaboratorInformations[0].user_id,
				name: collaboratorInformations[0].user_name,
				email: collaboratorInformations[0].user_email,
				password: collaboratorInformations[0].user_password,
				role: collaboratorInformations[0].user_role,
				birthDate: collaboratorInformations[0].user_birth_date,
				whatsApp: collaboratorInformations[0].user_whatsapp,
				cpf: collaboratorInformations[0].user_cpf,
				profilePreferences: collaboratorInformations[0].user_preferences
			} as UserResponseDTO,
			establishment: {
				id: collaboratorInformations[0].establishment_id,
				userId: collaboratorInformations[0].establishment_user_id,
				segmentId: collaboratorInformations[0].establishment_segment_id,
				code: collaboratorInformations[0].establishment_code,
				tradeName: collaboratorInformations[0].establishment_trade_name,
				logo: collaboratorInformations[0].establishment_logo,
				logoDark: collaboratorInformations[0].establishment_logo_dark,
				zipCode: collaboratorInformations[0].establishment_zip_code,
				street: collaboratorInformations[0].establishment_street,
				number: collaboratorInformations[0].establishment_number,
				complement: collaboratorInformations[0].establishment_complement,
				neighborhood: collaboratorInformations[0].establishment_neighborhood,
				city: collaboratorInformations[0].establishment_city,
				state: collaboratorInformations[0].establishment_state,
				mainPhone: collaboratorInformations[0].establishment_main_phone,
				website: collaboratorInformations[0].establishment_website,
				instagram: collaboratorInformations[0].establishment_instagram,
				linkedin: collaboratorInformations[0].establishment_linkedin,
				tiktok: collaboratorInformations[0].establishment_tiktok,
				youtube: collaboratorInformations[0].establishment_youtube,
				createdAt: collaboratorInformations[0].establishment_created_at,
				updatedAt: collaboratorInformations[0].establishment_updated_at,
			} as EstablishmentResponseDTO,
			services,
		} as CollaboratorResponseDTO;
	}


	private groupCollaborators<T extends { collaborator_id: string }>(rows: T[]): T[][] {
		const map = new Map<string, T[]>();

		for (const row of rows) {
			const collaboratorId = row.collaborator_id;
			if (!map.has(collaboratorId)) map.set(collaboratorId, []);
			map.get(collaboratorId)!.push(row);
		}

		return Array.from(map.values());
	}
}

