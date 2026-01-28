import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { Track } from "@shared/decorators/logs/track.decorator";
import { AbsenceBlockRepository } from "../repositories/absence-block.repository";
import { UpdateAbsenceBlockDTO } from "../models/dto/update-absence-block.dto";
import { AbsenceBlockEntity } from "../models/entity/absence-block.entity";
import { AbsenceBlockResponse } from "../models/dto/absence-block-response.dto";

@Service()
export class UpdateAbsenceBlockService {
  constructor(private readonly validatorUtils: ValidatorUtils) {}

  @Track()
  public async execute(payload: UpdateAbsenceBlockDTO): Promise<AbsenceBlockResponse.DTO> {
    log.info("Updating an absence for collaborator or service");
    const absence: AbsenceBlockEntity = await AbsenceBlockRepository.findOne({ where: { id: payload.id }});

    if (!absence) {
      log.error(`Absence not found with id. ID [${payload.id}]`);
      throw new BadRequestException("Ausência não encontrada");
    }

    if (payload.type === "collaborator" && !payload.collaboratorId) {
      log.error(`Absence type is invalid. Collaborator id is required: [${payload.collaboratorId}]`);
      throw new BadRequestException("Tipo de ausência para colaborador é inválida");
    }

    if (payload.type === "service" && !payload.serviceId) {
      log.error(`Absence type is invalid. Service id is required: [${payload.serviceId}]`);
      throw new BadRequestException("Tipo de ausência para serviço é inválida");
    }

    const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(absence, payload);

    if (Object.keys(fieldsToUpdate).length === 0) {
      log.warn(`Nothing to udpate for absence`);
      throw new BadRequestException("Não há nenhuma informação da ausência para atualizar");
    }

    fieldsToUpdate["isActive"] = fieldsToUpdate["active"]
    fieldsToUpdate["recurrenceRule"] = fieldsToUpdate["dayOfWeek"];

    delete fieldsToUpdate["active"]
    delete fieldsToUpdate["type"];
    delete fieldsToUpdate["frequency"];
    delete fieldsToUpdate["dayOfWeek"];

    const result = await AbsenceBlockRepository.createQueryBuilder()
        .update(AbsenceBlockEntity)
        .set({ ...fieldsToUpdate })
        .where("id = :id", { id: absence.id })
        .returning("*").execute();

    const absenceUpdated = result.raw[0];

    return {
      id: absenceUpdated.id,
      establishmentId: absenceUpdated.establishment_id,
      collaboratorId: absenceUpdated.collaborator_id,
      type: absenceUpdated.type,
      serviceId: absenceUpdated.service_id,
      dayOfWeek: null,
      specificDate: new Date(absenceUpdated.recurrence_rule),
      startTime: absenceUpdated.start_time,
      endTime: absenceUpdated.end_time,
      description: absenceUpdated.description,
      active: absenceUpdated.is_active,
      createdAt: absenceUpdated.created_at,
      updatedAt: absenceUpdated.updated_at,
      collaboratorName: null,
      serviceName: null
    };
  }
}
