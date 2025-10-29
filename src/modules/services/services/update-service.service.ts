import { Service } from "@shared/decorators/service.decorator";
import { ServicesRepository } from "../services.repository";
import { UpdateServiceDTO } from "../dto/update-service.dto";
import { ServiceResponseDTO } from "../dto/service-response.dto";
import { ServicesEntity } from "../services.entity";
import { log } from "@config/Logger";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";

@Service()
export class UpdateServiceService {

  constructor(
    private readonly servicesRepository: ServicesRepository,
    //- Utils
    private readonly validatorUtils: ValidatorUtils,
  ) {}

  public async execute(payload: UpdateServiceDTO): Promise<ServiceResponseDTO> {
    const service: ServicesEntity = await this.servicesRepository.findById(payload.id);

    if (!service) {
      log.error(`Service not found with id. ID [${payload.id}]`);
      throw new BadRequestException("Serviço não encontrado");
    }

    const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(service, payload);

    if (Object.keys(fieldsToUpdate).length === 0) {
      log.warn(`Nothing to udpate for service [${payload.name}]`);
      throw new BadRequestException("Não há nenhuma informação do serviço para atualizar");
    }

    await this.servicesRepository.update(service.id, fieldsToUpdate);

    return null;
  }
}