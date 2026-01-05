import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { ServicesEntity } from "../models/entity/services.entity";
import { ServicesRepository } from "../repositories/services.repository";

@Service()
export class DeleteServiceService {
	constructor() {}

	public async delete(idOrIds: string): Promise<void> {
		if (!idOrIds) {
			log.error(`Service ID's is required, but ID's is: [${idOrIds}]`);
			throw new InvalidArgumentException("O(s) ID(s) do(s) serviço(s) é / são obrigatórios");
		}

		const ids: string[] = idOrIds.split(/[|.&;]+/);

		for (const id of ids) {
			const serviceToDelete: ServicesEntity = await ServicesRepository.findById(id);

			if (!serviceToDelete) {
				log.error(`Service não encontrada com o ID [${id}]. A service não será deletada da base`);
			} else {
				ServicesRepository.delete(id);
			}
		}
	}
}
