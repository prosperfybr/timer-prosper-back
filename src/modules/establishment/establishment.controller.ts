import { log } from "@config/Logger";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { HttpStatusCode } from "axios";
import { Request, Response, NextFunction } from "express";
import { CreateEstablishmentDTO } from "./dto/create-establishment.dto";
import { EstablishmentResponseDTO } from "./dto/establishment-response.dto";
import { CreateEstablishmentService } from "./services/create-establishment.service";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { RolesEnum } from "@modules/users/dto/RolesEnum";
import { FindEstablishmentService } from "./services/find-establishment.service";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { PatchMapping } from "@shared/decorators/router/patch-mapping.decorator";
import { DeleteEstablishmentService } from "./services/delete-establishment.service";
import { UpdateEstablishmentService } from "./services/update-establishment.service";
import { UpdateEstablishmentDTO } from "./dto/update-establishment.dto";

@RequestMapping("establishment")
@RestController()
export class EstablishmentController {
	constructor(
		private readonly createEstablishmentService: CreateEstablishmentService,
		private readonly findEstablishmentService: FindEstablishmentService,
		private readonly deleteEstablishmentService: DeleteEstablishmentService,
		private readonly updateEstablishmentService: UpdateEstablishmentService
	) {}

	@PostMapping("")
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Creating a new establishment");
			const payload: CreateEstablishmentDTO = req.body;
			const establishment: EstablishmentResponseDTO = await this.createEstablishmentService.execute(payload);
			log.info("Establishent created successfully");
			return res.status(HttpStatusCode.Created).json({ message: "Estabelecimento criado com sucesso.", payload: establishment });
		} catch (error) {
			log.error("An error has occurred while create a new establishment. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/detail/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	public async findEstablishmentById(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Finding a establishment by id");
			const id: string = req.params.id;
			const establishment: EstablishmentResponseDTO = await this.findEstablishmentService.findById(id);
			log.info("Establishment founded successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimento detalhado com sucesso", payload: establishment});
		} catch (error) {
			log.error("An error has occurred while find a establishment. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/all", { authenticated: true, roles: [RolesEnum.ADMIN] })
	public async findAllEstablishments(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Finding all establishments");
			const id: string = req.params.id;
			const establishments: EstablishmentResponseDTO[] = await this.findEstablishmentService.findAll();
			log.info("All establishments founded successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimentos listados com sucesso", payload: establishments });
		} catch (error) {
			log.error("An error has occurred while find all establishments. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/all/owner", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	public async findAllOwnerEstablishments(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Finding all establishments by owner");
			const id: string = req.user.id;
			const establishments: EstablishmentResponseDTO[] = await this.findEstablishmentService.findAllByUser(id);
			log.info("All establishments by owner founded successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimentos listados com sucesso", payload: establishments });
		} catch (error) {
			log.error("An error has occurred while find all establishments owner. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Deleting a establishment");
			const id: string = req.params.id;
			await this.deleteEstablishmentService.delete(id);
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
			const payload: UpdateEstablishmentDTO = req.body;
			const establishment: EstablishmentResponseDTO = await this.updateEstablishmentService.execute(payload);
			log.info("Establishment updated successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimento atualizado com sucesso", payload: establishment });
		} catch (error) {
			log.error("An error has occurred while updating a establishment. ERROR: ", error);
			next(error);
		}
	}
}
