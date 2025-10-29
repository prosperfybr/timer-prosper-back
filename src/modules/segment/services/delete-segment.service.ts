import { Service } from "@shared/decorators/service.decorator";
import { SegmentRepository } from "../segment.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { SegmentEntity } from "../segment.entity";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { log } from "@config/Logger";
import { EstablishmentRepository } from "@modules/establishment/establishment.repository";
import { EstablishmentEntity } from "@modules/establishment/establishment.entity";

@Service()
export class DeleteSegmentService {

  constructor(private readonly segmentRepository: SegmentRepository, private readonly establishmentRepository: EstablishmentRepository) {}

  public async delete(id: string): Promise<void> {
    if (!id) {
      log.error(`ID is required, but ID received is [${id}]`);
      throw new InvalidArgumentException("O ID do tipo de serviço é obrigatório");
    }

    const segment: SegmentEntity = await this.segmentRepository.findById(id);

    if (!segment) {
      log.warn(`Segment not deleted. Service type not found`);
      throw new BadRequestException("Segmento não encontrado");
    }

    const segmentEsablishments: EstablishmentEntity[] = await this.establishmentRepository.findBySegment(segment.id);
    if (segmentEsablishments.length > 0) {
      log.error(`It is not possible to delete a segment because has establishments associated.`);
      throw new BadRequestException("Não é possível excluir este segmento, pois existem estabelecimentos associados a ele.");
    }

    await this.segmentRepository.delete(id);
  }
}