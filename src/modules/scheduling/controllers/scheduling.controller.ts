import { log } from "@config/Logger";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { CreateSchedulingService } from "../services/create-scheduling.service";
import { FindSchedulingService } from "../services/find-scheduling.service";
import { CancelSchedulingService } from "../services/cancel-scheduling.service";
import { ControllerLog } from "@shared/decorators/logs/controller.decorator";

@RequestMapping("/scheduling")
@RestController()
export class SchedulingController {
	constructor(
		private readonly createSchedulingService: CreateSchedulingService,
		private readonly findSchedulingService: FindSchedulingService,
		private readonly cancelSchedulingService: CancelSchedulingService,
	) {}

	@PostMapping("")
	@ControllerLog()
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const payload = req.body;
			const scheduled = await this.createSchedulingService.execute(payload);
			return res.status(HttpStatusCode.Created).json({ message: "Agendamento criado com sucesso", payload: scheduled });
		} catch (error) {
			log.error("An error has occurred while create a new scheduling. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/slot/:establishmentId/:serviceId/:collaboratorId/:date", { authenticated: true })
	@ControllerLog()
	public async findById(req: Request, res: Response, next: NextFunction) {
		try {
			const { establishmentId, serviceId, collaboratorId, date } = req.params;
			const slots = await this.findSchedulingService.findAvailableSlots(establishmentId, date, serviceId, collaboratorId);
			return res.status(HttpStatusCode.Ok).json({ message: "Horários disponíveis para agendamento listados com sucesso", payload: slots });
		} catch (error) {
			log.error("An error has occurred while find a scheduling slot. ERROR:  ", error);
			next(error);
		}
	}

	@GetMapping("/all/:id")
	@ControllerLog()
	public async findAll(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id;
			const appointments = await this.findSchedulingService.findAllClientScheduling(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Agendamentos do cliente listados com sucesso.", payload: appointments });
		} catch (error) {
			log.error("An error has occurred while list all segments. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true })
	@ControllerLog()
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id;
			await this.cancelSchedulingService.execute(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Segmento deletado com sucesso" });
		} catch (error) {
			log.error("An error has occurred while deleting segment. ERROR: ", error);
			next(error);
		}
	}
}
