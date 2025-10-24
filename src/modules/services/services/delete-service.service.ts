import { Service } from "@shared/decorators/service.decorator";
import { ServicesRepository } from "../services.repository";
import { log } from "@config/Logger";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { ServicesEntity } from "../services.entity";

@Service()
export class DeleteServiceService {

  constructor(
    private readonly servicesRepository: ServicesRepository
  ) {}

  public async delete(idOrIds: string): Promise<void> {
    if (!idOrIds) {
      log.error(`Service ID's is required, but ID's is: [${idOrIds}]`);
      throw new InvalidArgumentException("O(s) ID(s) do(s) serviço(s) é / são obrigatórios");
    }

    const ids: string[] = idOrIds.split(/[|.&;]+/);

    for(const id of ids) {
      const serviceToDelete: ServicesEntity = await this.servicesRepository.findById(id);

      if (!serviceToDelete) {
        log.error(`Service não encontrada com o ID [${id}]. A service não será deletada da base`);
      } else {
        this.servicesRepository.delete(id);
      }
    }
  }
}