import { Service } from "@shared/decorators/service.decorator";
import { ServiceTypeRepository } from "../servicetype.repository";
import { UpdateServiceTypeDTO } from "../dto/update-service-type.dto";
import { ServiceTypeResponseDTO } from "../dto/service-type-response.dto";
import { ServiceTypeEntity } from "../servicetype.entity";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { log } from "@config/Logger";
import { ValidatorUtils } from "@shared/utils/validator.utils";

@Service()
export class UpdateServiceTypeService {

  constructor(private readonly serviceTypeRepository: ServiceTypeRepository,
    private readonly validatorUtils: ValidatorUtils
  ) {}

  public async udpdate(payload: UpdateServiceTypeDTO): Promise<ServiceTypeResponseDTO> {
    const serviceType: ServiceTypeEntity = await this.serviceTypeRepository.findById(payload.id);

    if (!serviceType) {
      log.error(`Service type not found by id. ID [${payload.id}]`);
      throw new BadRequestException("Tipo de serviço não encontrado");
    }

    const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(serviceType, payload);

    if (Object.keys(fieldsToUpdate).length === 0) {
      log.warn(`Nothing to update for service type [${payload.name}]`);
      throw new BadRequestException("Não há nenhuma informação do tipo de serviço para atualizar");
    }

    await this.serviceTypeRepository.update(serviceType.id, fieldsToUpdate);
    return null;
  }
}