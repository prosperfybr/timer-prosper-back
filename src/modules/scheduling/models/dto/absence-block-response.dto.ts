import { Service } from "@shared/decorators/service.decorator";
import { AbsenceBlockEntity } from "../entity/absence-block.entity";
import { AbsenceBlockTypeEnum } from "../enums/absence-block-type.enum";
import { DaysOfWeekEnum } from "@modules/establishment/models/enums/days-of-week.enum";
import { CollaboratorRepository } from "@modules/collaborators/repositories/collaborator.repository";
import { ServicesRepository } from "@modules/services/repositories/services.repository";
import { CollaboratorEntity } from "@modules/collaborators/models/entity/collaborator.entity";
import { ServicesEntity } from "@modules/services/models/entity/services.entity";

@Service()
export class AbsenceBlockResponse {
	constructor() {}

	public async toDto(availability: AbsenceBlockEntity | AbsenceBlockEntity[]): Promise<AbsenceBlockResponse.DTO[]> {
		if (Array.isArray(availability)) {
			const absences: AbsenceBlockResponse.DTO[] = [];
			for (const absence of availability) {
				absences.push(await this.fillObject(absence));
			}

			return absences;
		} else return [await this.fillObject(availability)];
	}

	private async fillObject(availability: AbsenceBlockEntity): Promise<AbsenceBlockResponse.DTO> {
		const collaborator: CollaboratorEntity | null = availability.collaboratorId
			? await CollaboratorRepository.findOne({ where: { id: availability.collaboratorId }, relations: ["user"] })
			: null;
		const service: ServicesEntity | null = availability.serviceId ? await ServicesRepository.findById(availability.serviceId) : null;
		const daysOfWeekNumbers = ["0", "1", "2", "3", "4", "5", "6"];
		return {
			id: availability.id,
			collaboratorId: availability.collaboratorId,
			establishmentId: availability.establishmentId,
			type: availability.collaboratorId ? AbsenceBlockTypeEnum.BY_COLLABORATOR : AbsenceBlockTypeEnum.BY_SERVICE,
			serviceId: availability.serviceId,
			dayOfWeek: daysOfWeekNumbers.includes(availability.recurrenceRule) ? availability.recurrenceRule : null,
			specificDate: !daysOfWeekNumbers.includes(availability.recurrenceRule) ? new Date(availability.recurrenceRule) : null,
			startTime: availability.startTime,
			endTime: availability.endTime,
			description: availability.description,
			active: availability.isActive,
			createdAt: availability.createdAt,
			updatedAt: availability.updatedAt,
			collaboratorName: collaborator ? collaborator.user.name : null,
			serviceName: service ? service.name : null,
			frequency: daysOfWeekNumbers.includes(availability.recurrenceRule) ? "recurring" : null,
		};
	}
}

export namespace AbsenceBlockResponse {
	export interface DTO {
		id: string;
		establishmentId: string;
		collaboratorId: string;
		type: AbsenceBlockTypeEnum;
		serviceId: string;
		dayOfWeek: number | string | null;
		specificDate: Date | null;
		startTime: string;
		endTime: string;
		description: string;
		active: boolean;
		createdAt: Date;
		updatedAt: Date;
		collaboratorName: string;
		serviceName: string;
		frequency?: "recurring" | null;
	}
}
