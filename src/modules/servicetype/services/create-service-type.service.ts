import { Service } from "@shared/decorators/service.decorator";
import { ServiceTypeRepository } from '../servicetype.repository';
import { CreateServiceTypeDTO } from "../dto/create-service-type.dto";
import { ServiceTypeResponseDTO } from "../dto/service-type-response.dto";
import { log } from "@config/Logger";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { ServiceTypeEntity } from "../servicetype.entity";

@Service()
export class CreateServiceTypeService {

  constructor(
    private readonly serviceTypeRepository: ServiceTypeRepository
  ) {}

  public async execute(payload: CreateServiceTypeDTO): Promise<ServiceTypeResponseDTO> {
    const { name, description } = payload;

    if (!name || name.trim().length < 3) {
      log.error("Service type name is invalid. Must be contains at least 3 characters");
      throw new InvalidArgumentException("O nome do tipo de serviço é inválido");
    }

    if (description && description.trim().length < 5) {
      log.error("Service type description is invalid. Is too short");
      throw new InvalidArgumentException("A descrição do tipo de serviço é inválida");
    }

    const serviceType: ServiceTypeEntity = new ServiceTypeEntity();
    serviceType.name = name;
    serviceType.description = description;

    const serviceTypeSaved: ServiceTypeEntity = await this.serviceTypeRepository.save(serviceType);

    return {
      id: serviceTypeSaved.id,
      name: serviceTypeSaved.name,
      description: serviceTypeSaved.description,
      services: null
    } as ServiceTypeResponseDTO
  }
}