import { Service } from "@shared/decorators/service.decorator";
import { SegmentRepository } from "../segment.repository";
import { SegmentResponseDTO } from "../dto/segment-response.dto";
import { log } from "@config/Logger";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { SegmentEntity } from "../segment.entity";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ConverterUtils } from "@shared/utils/converter.utils";

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
			active: segment.isActive
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
				active: segment.isActive
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
					active: segment.isActive
				} as SegmentResponseDTO)
		);
	}
}
