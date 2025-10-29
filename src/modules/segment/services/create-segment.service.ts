import { Service } from "@shared/decorators/service.decorator";
import { SegmentRepository } from '../segment.repository';
import { CreateSegmentDTO } from "../dto/create-segment.dto";
import { SegmentResponseDTO } from "../dto/segment-response.dto";
import { log } from "@config/Logger";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { SegmentEntity } from "../segment.entity";

@Service()
export class CreateSegmentService {

  constructor(
    private readonly segmentRepository: SegmentRepository
  ) {}

  public async execute(payload: CreateSegmentDTO): Promise<SegmentResponseDTO> {
    const { name, active } = payload;

    if (!name || name.trim().length < 3) {
      log.error("Segment name is invalid. Must be contains at least 3 characters");
      throw new InvalidArgumentException("O nome do segmento é inválido");
    }

    const segment: SegmentEntity = new SegmentEntity();
    segment.name = name;
    segment.isActive = active !== null && active !== undefined ? active : false;

    const segmentSaved: SegmentEntity = await this.segmentRepository.save(segment);

    return {
      id: segmentSaved.id,
      name: segmentSaved.name,
      active: segmentSaved.isActive
    } as SegmentResponseDTO
  }
}