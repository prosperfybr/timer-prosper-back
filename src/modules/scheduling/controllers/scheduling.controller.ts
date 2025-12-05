import { log } from "@config/Logger";
import { RolesEnum } from "@modules/users/models/enum/roles.enum";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { PatchMapping } from "@shared/decorators/router/patch-mapping.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { CreateSchedulingService } from "../services/create-scheduling.service";
import { FindSchedulingService } from '../services/find-scheduling.service';

@RequestMapping("/scheduling")
@RestController()
export class SchedulingController {
	constructor(
		private readonly createSchedulingService: CreateSchedulingService,
		private readonly findSchedulingService: FindSchedulingService
	) {}

	@PostMapping("")
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Creating a new scheduling");
			const payload = req.body;
			const scheduled = await this.createSchedulingService.execute(payload);
			log.info("Scheduling created successfull");
			return res.status(HttpStatusCode.Created).json({ message: "Agendamento criado com sucesso", payload: scheduled });
		} catch (error) {
			log.error("An error has occurred while create a new scheduling. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/slot/:establishmentId/:serviceId/:collaboratorId/:date", { authenticated: true })
	public async findById(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Finding a establishment slot by establishment, service, collaborator and date");
			const {establishmentId, serviceId, collaboratorId, date } = req.params;
			const slots = await this.findSchedulingService.findAvailableSlots(establishmentId, date, serviceId, collaboratorId);
			log.info("Establishment slots founded successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Horários disponíveis para agendamento listados com sucesso", payload: slots });
		} catch (error) {
			log.error("An error has occurred while find a scheduling slot. ERROR:  ", error);
			next(error);
		}
	}

	@GetMapping("/all/:id")
	public async findAll(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("List all client scheduling");
			const id: string = req.params.id;
			const appointments = await this.findSchedulingService.findAllClientScheduling(id);
			log.info("All client scheduling are listed successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Agendamentos do cliente listados com sucesso.", payload: appointments });
		} catch (error) {
			log.error("An error has occurred while list all segments. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Updating segment");
			log.info("Segment udpated successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Segmento atualizado com sucesso.", payload: null });
		} catch (error) {
			log.error("An error has occurred while updating a segment. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Deleting a segment");
			log.info("Segment deleted successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Segmento deletado com sucesso" });
		} catch (error) {
			log.error("An error has occurred while deleting segment. ERROR: ", error);
			next(error);
		}
	}
}
