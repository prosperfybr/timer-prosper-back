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

@RequestMapping("/scheduling")
@RestController()
export class SchedulingController {
	constructor(
	) {}

	@PostMapping("")
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Creating a new scheduling");
			log.info("Scheduling created successfull");
			return res.status(HttpStatusCode.Created).json({ message: "Agendamento criado com sucesso", payload: null });
		} catch (error) {
			log.error("An error has occurred while create a new Scheduling. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/detail/:id", { authenticated: true })
	public async findById(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Finding a segment by id");
			log.info("Segment founded successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Segmento detalhado com sucesso", payload: null });
		} catch (error) {
			log.error("An error has occurred while find a segment. ERROR:  ", error);
			next(error);
		}
	}

	@GetMapping("")
	public async findAll(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("List all segments");
			log.info("Segments is listed successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Segmentos listados com sucesso.", payload: null });
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
