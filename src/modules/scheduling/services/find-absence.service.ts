import { Service } from "@shared/decorators/service.decorator";
import { AbsenceBlockResponse } from "../models/dto/absence-block-response.dto";
import { log } from "@config/Logger";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { AbsenceBlockRepository } from "../repositories/absence-block.repository";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";

@Service()
export class FindAbsenceBlockService {

  constructor(
    //- Repositories
    private readonly establishmentRepository: EstablishmentRepository,
    private readonly absenceBlockRepository: AbsenceBlockRepository,
    //- Mappers
    private readonly mapper: AbsenceBlockResponse
  ) {}

  public async find(establishmentId: string): Promise<AbsenceBlockResponse.DTO[]> {
    log.info("Finding all absences in establishment");

    if (!establishmentId) {
      log.error(`Establishment ID is required, but received [${establishmentId}]`);
      throw new InvalidArgumentException("ID do estabelecimento obrigatório");
    }

    const establishment: EstablishmentEntity = await this.establishmentRepository.findById(establishmentId);
    
    if (!establishment) {
      log.error(`Establishment not found by id [${establishmentId}]`);
      throw new InvalidArgumentException("Estabelecimento não encontrado");
    }

    const absences = await this.absenceBlockRepository.findAllByEstablishment(establishment.id);
    
    if (!absences || absences.length === 0) {
      log.info(`No absences registered yet to establishment [${establishment.id}]`)
      return [];
    }

    return await this.mapper.toDto(absences );
  }
}