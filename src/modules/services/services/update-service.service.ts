import { Service } from "@shared/decorators/service.decorator";
import { ServicesRepository } from "../services.repository";
import { UpdateServiceDTO } from "../dto/update-service.dto";
import { ServiceResponseDTO } from "../dto/service-response.dto";
import { ServicesEntity } from "../services.entity";
import { log } from "@config/Logger";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { ConverterUtils } from "@shared/utils/converter.utils";

interface ComparisonUpdateService {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  serviceTypeId?: string;
}
@Service()
export class UpdateServiceService {

  constructor(
    private readonly servicesRepository: ServicesRepository,
    //- Utils
    private readonly validatorUtils: ValidatorUtils,
    private readonly converterUtils: ConverterUtils
  ) {}

  public async execute(payload: UpdateServiceDTO): Promise<ServiceResponseDTO> {
    const service: ServicesEntity = await this.servicesRepository.findById(payload.id);

    if (!service) {
      log.error(`Service not found with id. ID [${payload.id}]`);
      throw new BadRequestException("Serviço não encontrado");
    }

    const comparisonServiceUpdate: ComparisonUpdateService = {
      id: payload.id,
      name: payload.name,
      description: payload.description,
      price: payload.price ? this.converterUtils.convertFloatToCents(payload.price) : service.price,
      duration: payload.duration ? this.converterUtils.convertDurationInMinutes(payload.duration): service.duration,
      serviceTypeId: payload.serviceTypeId
    };

    const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(service, comparisonServiceUpdate);

    if (Object.keys(fieldsToUpdate).length === 0) {
      log.warn(`Nothing to udpate for service [${payload.name}]`);
      throw new BadRequestException("Não há nenhuma informação do serviço para atualizar");
    }

    await this.servicesRepository.update(service.id, fieldsToUpdate);

    return null;
  }
}