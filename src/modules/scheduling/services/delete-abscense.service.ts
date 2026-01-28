import { log } from "@config/Logger";
import { Track } from "@shared/decorators/logs/track.decorator";
import { Service } from "@shared/decorators/service.decorator";
import { AbsenceBlockRepository } from "../repositories/absence-block.repository";

@Service()
export class DeleteAbsenceBlockService {
	constructor() {}

	@Track()
	public async execute(id: string): Promise<void> {
		log.info("Deleting an existing absence for service or collaborator");
		await AbsenceBlockRepository.delete({ id });
		log.info("If any absence exists is deleted successfully");
		return;
	}
}
