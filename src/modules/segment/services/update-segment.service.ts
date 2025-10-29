import { Service } from "@shared/decorators/service.decorator";
import { SegmentRepository } from "../segment.repository";
import { UpdateSegmentDTO } from "../dto/update-segment.dto";
import { SegmentResponseDTO } from "../dto/segment-response.dto";
import { SegmentEntity } from "../segment.entity";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { log } from "@config/Logger";
import { ValidatorUtils } from "@shared/utils/validator.utils";

@Service()
export class UpdateSegmentService {

  constructor(private readonly segmentRepository: SegmentRepository,
    private readonly validatorUtils: ValidatorUtils
  ) {}

  public async udpdate(payload: UpdateSegmentDTO): Promise<SegmentResponseDTO> {
    const segment: SegmentEntity = await this.segmentRepository.findById(payload.id);

    if (!segment) {
      log.error(`Segment not found by id. ID [${payload.id}]`);
      throw new BadRequestException("Segmento não encontrado");
    }

    const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(segment, payload);

    if (Object.keys(fieldsToUpdate).length === 0) {
      log.warn(`Nothing to update for segment [${payload.name}]`);
      throw new BadRequestException("Não há nenhuma informação do segmento para atualizar");
    }

    await this.segmentRepository.update(segment.id, fieldsToUpdate);
    return null;
  }
}