import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { SegmentResponseDTO } from "../models/dto/segment-response.dto";
import { SegmentEntity } from "../models/entity/segment.entity";
import { SegmentRepository } from "../repositories/segment.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class FindSegmentService {
	constructor() {}

	@Track()
	public async findById(id: string): Promise<SegmentResponseDTO> {
		log.info(`Starting search for a segment by id [${id}]`);

		if (!id) {
			log.error(`Segment ID is required, but ID is: [${id}]`);
			throw new InvalidArgumentException("O ID do segmento é inválido");
		}

		const segment: SegmentEntity = await SegmentRepository.findById(id);

		if (!segment) {
			log.error(`Segment is not found`);
			throw new BadRequestException("Segmento não encontrado");
		}

		return {
			id: segment.id,
			name: segment.name,
			active: segment.isActive,
		} as SegmentResponseDTO;
	}

	@Track()
	public async findAllActives(): Promise<SegmentResponseDTO[]> {
		log.info(`Listing all segments [ACTIVE]`);
		const segments: SegmentEntity[] = await SegmentRepository.findAllActive();
		if (segments.length === 0) {
			log.error(`Any segment active yet`);
			throw new BadRequestException("Sem segmentos ativos cadastrados");
		}

		return segments.map(
			(segment) =>
				({
					id: segment.id,
					name: segment.name,
					active: segment.isActive,
				}) as SegmentResponseDTO,
		);
	}

	@Track()
	public async findAll(): Promise<SegmentResponseDTO[]> {
		log.info(`Listing all segments`);
		const segments: SegmentEntity[] = await SegmentRepository.findAll();
		if (segments.length === 0) {
			log.error("Any segment founded yet");
			throw new BadRequestException("Sem segmentos cadastrados");
		}

		return segments.map(
			(segment) =>
				({
					id: segment.id,
					name: segment.name,
					active: segment.isActive,
				}) as SegmentResponseDTO,
		);
	}
}
