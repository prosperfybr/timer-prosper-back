import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { ConverterUtils } from "@shared/utils/converter.utils";
import { SegmentResponseDTO } from "../models/dto/scheduling-response.dto";
import { SegmentEntity } from "../models/entity/collaborator-availability.entity";
import { SegmentRepository } from "../repositories/time-block.repository";

@Service()
export class FindSegmentService {
	constructor(private readonly segmentRepository: SegmentRepository, private readonly converterUtils: ConverterUtils) {}

	public async findById(id: string): Promise<SegmentResponseDTO> {
		log.info(`Starting search for a segment by id [${id}]`);

		if (!id) {
			log.error(`Segment ID is required, but ID is: [${id}]`);
			throw new InvalidArgumentException("O ID do segmento é inválido");
		}

		const segment: SegmentEntity = await this.segmentRepository.findById(id);

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

	public async findAllActives(): Promise<SegmentResponseDTO[]> {
		log.info(`Listing all segments [ACTIVE]`);
		const segments: SegmentEntity[] = await this.segmentRepository.findAllActive();
		if (segments.length === 0) {
			log.error(`Any segment active yet`);
			throw new BadRequestException("Sem segmentos ativos cadastrados");
		}

		return segments.map(
			segment =>
				({
					id: segment.id,
					name: segment.name,
					active: segment.isActive,
				} as SegmentResponseDTO)
		);
	}

	public async findAll(): Promise<SegmentResponseDTO[]> {
		log.info(`Listing all segments`);
		const segments: SegmentEntity[] = await this.segmentRepository.findAll();
		if (segments.length === 0) {
			log.error("Any segment founded yet");
			throw new BadRequestException("Sem segmentos cadastrados");
		}

		return segments.map(
			segment =>
				({
					id: segment.id,
					name: segment.name,
					active: segment.isActive,
				} as SegmentResponseDTO)
		);
	}
}
