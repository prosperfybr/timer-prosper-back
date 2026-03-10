import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { EstablishmentResponseDTO } from "../models/dto/establishment/establishment-response.dto";
import { UpdateEstablishmentDTO } from "../models/dto/establishment/update-establishment.dto";
import { EstablishmentEntity } from "../models/entity/establishment.entity";
import { EstablishmentRepository } from "../repositories/establishment.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class UpdateEstablishmentService {
	constructor(private readonly validatorUtils: ValidatorUtils) {}

	@Track()
	public async execute(payload: UpdateEstablishmentDTO): Promise<EstablishmentResponseDTO> {
		const establishment: EstablishmentEntity = await EstablishmentRepository.findByIdOrCode(payload.id);

		if (!establishment) {
			log.error(`Establishment not found with id. ID [${payload.id}]`);
			throw new BadRequestException("Estabelecimento não encontrado");
		}

		const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(establishment, payload);

		if (Object.keys(fieldsToUpdate).length === 0) {
			log.warn(`Nothing to update for establishment [${establishment.tradeName}]`);
			throw new BadRequestException("Não há nenhuma informação do estabelecimento para atualizar");
		}

		delete fieldsToUpdate.segmentId; //- Is not possible update segment

		const result = await EstablishmentRepository.createQueryBuilder()
			.update(EstablishmentEntity)
			.set({ ...fieldsToUpdate })
			.where("id = :id", { id: establishment.id })
			.returning("*")
			.execute();

		const establishmentUpdated = result.raw[0];

		return {
			id: establishmentUpdated.id,
			userId: establishmentUpdated.user_id,
			code: establishmentUpdated.code,
			tradeName: establishmentUpdated.trade_name,
			logo: establishmentUpdated.logo,
			logoDark: establishmentUpdated.logo_dark,
			zipCode: establishmentUpdated.zip_code,
			street: establishmentUpdated.street,
			number: establishmentUpdated.number,
			complement: establishmentUpdated.complement,
			neighborhood: establishmentUpdated.neighborhood,
			city: establishmentUpdated.city,
			state: establishmentUpdated.state,
			mainPhone: establishmentUpdated.main_phone,
			website: establishmentUpdated.website,
			instagram: establishmentUpdated.instagram,
			linkedin: establishmentUpdated.linkedin,
			tiktok: establishmentUpdated.tiktok,
			youtube: establishmentUpdated.youtube,
			createdAt: establishmentUpdated.created_at,
			user: null,
			services: [],
			segment: null,
		} as EstablishmentResponseDTO;
	}
}
