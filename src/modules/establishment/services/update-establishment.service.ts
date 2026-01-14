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

		await EstablishmentRepository.update(establishment.id, fieldsToUpdate);
		return null;
	}
}
