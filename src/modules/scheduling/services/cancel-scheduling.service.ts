import { Service } from "@shared/decorators/service.decorator";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { log } from "@config/Logger";
import { AppointmentEntity } from "../models/entity/appointment.entity";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { AppointmentStatusEnum } from "../models/enums/appointment-status.enum";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class CancelSchedulingService {

  constructor() {}

  @Track()
  public async execute(id: string): Promise<void> {
    log.info("Excluding a appointment");
    const appointment: AppointmentEntity = await AppointmentRepository.findOne({ where: { id }});

    if (!appointment) {
      log.error(`Appointment not found by id [${id}]`);
      throw new BadRequestException("Agendamento não encontrado");
    }

    await AppointmentRepository.update(appointment.id, { status: AppointmentStatusEnum.CANCELLED });
    log.info("Appointment excluded");
  }
}