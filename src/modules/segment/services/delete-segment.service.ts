import { log } from "@config/Logger";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { SegmentEntity } from "../models/entity/segment.entity";
import { SegmentRepository } from "../repositories/segment.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class DeleteSegmentService {
	constructor() {}

	@Track()
	public async delete(id: string): Promise<void> {
		if (!id) {
			log.error(`ID is required, but ID received is [${id}]`);
			throw new InvalidArgumentException("O ID do tipo de serviço é obrigatório");
		}

		const segment: SegmentEntity = await SegmentRepository.findById(id);

		if (!segment) {
			log.warn(`Segment not deleted. Service type not found`);
			throw new BadRequestException("Segmento não encontrado");
		}

		const segmentEsablishments: EstablishmentEntity[] = await EstablishmentRepository.findBySegment(segment.id);
		if (segmentEsablishments.length > 0) {
			log.error(`It is not possible to delete a segment because has establishments associated.`);
			throw new BadRequestException("Não é possível excluir este segmento, pois existem estabelecimentos associados a ele.");
		}

		await SegmentRepository.delete(id);
	}
}
