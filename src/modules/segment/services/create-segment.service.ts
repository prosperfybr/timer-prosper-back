import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { CreateSegmentDTO } from "../models/dto/create-segment.dto";
import { SegmentResponseDTO } from "../models/dto/segment-response.dto";
import { SegmentEntity } from "../models/entity/segment.entity";
import { SegmentRepository } from "../repositories/segment.repository";

@Service()
export class CreateSegmentService {
	constructor() {}

	public async execute(payload: CreateSegmentDTO): Promise<SegmentResponseDTO> {
		const { name, active } = payload;

		if (!name || name.trim().length < 3) {
			log.error("Segment name is invalid. Must be contains at least 3 characters");
			throw new InvalidArgumentException("O nome do segmento é inválido");
		}

		const segment: SegmentEntity = new SegmentEntity();
		segment.name = name;
		segment.isActive = active !== null && active !== undefined ? active : false;

		const segmentSaved: SegmentEntity = await SegmentRepository.save(segment);

		return {
			id: segmentSaved.id,
			name: segmentSaved.name,
			active: segmentSaved.isActive,
		} as SegmentResponseDTO;
	}
}
