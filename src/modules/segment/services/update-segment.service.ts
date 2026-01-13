import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { SegmentResponseDTO } from "../models/dto/segment-response.dto";
import { UpdateSegmentDTO } from "../models/dto/update-segment.dto";
import { SegmentEntity } from "../models/entity/segment.entity";
import { SegmentRepository } from "../repositories/segment.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class UpdateSegmentService {
	constructor(private readonly validatorUtils: ValidatorUtils) {}

	@Track()
	public async udpdate(payload: UpdateSegmentDTO): Promise<SegmentResponseDTO> {
		const segment: SegmentEntity = await SegmentRepository.findById(payload.id);

		if (!segment) {
			log.error(`Segment not found by id. ID [${payload.id}]`);
			throw new BadRequestException("Segmento não encontrado");
		}

		const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(segment, payload);

		if (Object.keys(fieldsToUpdate).length === 0) {
			log.warn(`Nothing to update for segment [${payload.name}]`);
			throw new BadRequestException("Não há nenhuma informação do segmento para atualizar");
		}

		await SegmentRepository.update(segment.id, fieldsToUpdate);
		return null;
	}
}
