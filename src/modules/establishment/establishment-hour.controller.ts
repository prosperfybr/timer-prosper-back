import { log } from "@config/Logger";
import { RolesEnum } from "@modules/users/dto/RolesEnum";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { PatchMapping } from "@shared/decorators/router/patch-mapping.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";

@RequestMapping("establishment-hours")
@RestController()
export class EstablishmentHourController {

	constructor() {}

	@PostMapping("")
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Creating a new hour for establishment");
			log.info("Hour for establishent created successfully");
			return res.status(HttpStatusCode.Created).json({ message: "Horário de funcionamento do estabelecimento criado com sucesso.", payload: null });
		} catch (error) {
			log.error("An error has occurred while create a new establishment. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/detail/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER, RolesEnum.CLIENT, RolesEnum.COLLABORATOR] })
	public async findEstablishmentById(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Finding a establishment by id");
			log.info("Establishment founded successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimento detalhado com sucesso", payload: null});
		} catch (error) {
			log.error("An error has occurred while find a establishment. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/all", { authenticated: true, roles: [RolesEnum.ADMIN] })
	public async findAllEstablishments(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Finding all establishments");
			log.info("All establishments founded successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimentos listados com sucesso", payload: null });
		} catch (error) {
			log.error("An error has occurred while find all establishments. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Deleting a establishment");
			log.info("Establishment deleted successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimento deletado com sucesso."});
		} catch (error) {
			log.error("An error has occurred while delete a establishment. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER]})
	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Updating a establishment");
			log.info("Establishment updated successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimento atualizado com sucesso", payload: null });
		} catch (error) {
			log.error("An error has occurred while updating a establishment. ERROR: ", error);
			next(error);
		}
	}
}
