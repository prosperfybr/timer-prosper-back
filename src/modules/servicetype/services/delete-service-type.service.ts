import { Service } from "@shared/decorators/service.decorator";
import { ServiceTypeRepository } from "../servicetype.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { ServiceTypeEntity } from "../servicetype.entity";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { log } from "@config/Logger";

@Service()
export class DeleteServiceTypeService {

  constructor(private readonly serviceTypeRepository: ServiceTypeRepository) {}

  public async delete(id: string): Promise<void> {
    if (!id) {
      log.error(`ID is required, but ID received is [${id}]`);
      throw new InvalidArgumentException("O ID do tipo de serviço é obrigatório");
    }

    const serviceType: ServiceTypeEntity = await this.serviceTypeRepository.findById(id);

    if (!serviceType) {
      log.warn(`Service type is not deleted. Service type not found`);
      throw new BadRequestException("Tipo de serviço não encontrado");
    }
    
    if (serviceType.services.length > 0) {
      log.error(`It is not possible to delete a service type with associated services.`);
      throw new BadRequestException("Não é possível excluir este tipo de serviço pois tem serviços associado a este tipo.");
    }

    await this.serviceTypeRepository.delete(id);
  }
}