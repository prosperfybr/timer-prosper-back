import { log } from "@config/Logger";
import { NextFunction, Request, Response } from "express";

import { RolesEnum } from "@modules/users/models/enum/roles.enum";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { PatchMapping } from "@shared/decorators/router/patch-mapping.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { HttpStatusCode } from "axios";
import { CollaboratorResponseDTO } from "../models/dto/collaborator-response.dto";
import { CreateCollaboratorDTO } from "../models/dto/create-collaborator.dto";
import { UpdateCollaboratorDTO } from "../models/dto/update-collaborator.dto";
import { CreateCollaboratorService } from "../services/create-collaborator.service";
import { DeleteCollaboratorService } from "../services/delete-collaborator.service";
import { FindCollaboratorService } from "../services/find-collaborator.service";
import { UpdateCollaboratorService } from "../services/update-collaborator.service";
import { ControllerLog } from "@shared/decorators/logs/controller.decorator";

@RequestMapping("collaborator")
@RestController()
export class CollaboratorController {
	constructor(
		private readonly createCollaboratorService: CreateCollaboratorService,
		private readonly findCollaboratorService: FindCollaboratorService,
		private readonly updateCollaboratorService: UpdateCollaboratorService,
		private readonly deleteCollaboratorService: DeleteCollaboratorService
	) {}

	@PostMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const collaborator: CreateCollaboratorDTO = req.body as CreateCollaboratorDTO;
			const collaboratorCreated: CollaboratorResponseDTO = await this.createCollaboratorService.execute(collaborator);
			return res.status(HttpStatusCode.Created).json({ message: "Colaborador criado com sucesso.", payload: collaboratorCreated });
		} catch (error) {
			log.error("An error has occurred while save a new collaborator. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/:collaboratorId", { authenticated: true })
	@ControllerLog()
	public async getCollaborator(req: Request, res: Response, next: NextFunction) {
		try {
			const id = req.params.collaboratorId;
			const collaborator: CollaboratorResponseDTO = await this.findCollaboratorService.execute(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Colaborador encontrado com sucesso", payload: collaborator });
		} catch (error) {
			log.error("An error has occurred while find collaborator by id. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/all/establishment/:establishmentId", { authenticated: true })
	@ControllerLog()
	public async getAllEstablishmentCollaborators(req: Request, res: Response, next: NextFunction) {
		try {
			const establishmentId: string = req.params.establishmentId;
			const userRole: RolesEnum = req.user.role as RolesEnum;
			if ((userRole === RolesEnum.ADMIN || userRole === RolesEnum.CLIENT || userRole === RolesEnum.COLLABORATOR) && (!establishmentId || establishmentId === 'undefined')) {
				log.info("Is loading in dashboard request, user is not owner.");
				return res.status(HttpStatusCode.Ok).json({ message: "Não há colaboradores para carregar no momento" });
			}
			const collaborators: CollaboratorResponseDTO[] = await this.findCollaboratorService.getAllEstablishmentCollaborators(establishmentId);
			return res.status(HttpStatusCode.Ok).json({ message: "Colaboradores do estabelecimento listados com sucesso", payload: collaborators });
		} catch (error) {
			log.error("An error has occurred while find all establishment collaborators. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("", { authenticated: true })
	@ControllerLog()
	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const userToUpdate: UpdateCollaboratorDTO = req.body as UpdateCollaboratorDTO;
			const collaboratorUpdated: CollaboratorResponseDTO = await this.updateCollaboratorService.execute(userToUpdate.id, userToUpdate);
			return res.status(HttpStatusCode.Ok).json({ message: "Cadastro do colaborador atualizado com sucesso.", payload: collaboratorUpdated });
		} catch (error) {
			log.error("An error has occurred while update collaborator informations. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("/toggle-status/:collaboratorId", { authenticated: true })
	@ControllerLog()
	public async toggleStatus(req: Request, res: Response, next: NextFunction) {
		try {
			const id = req.params.collaboratorId;
			await this.updateCollaboratorService.toggleStatus(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Cadastro do colaborador atualizado com sucesso." });
		} catch (error) {
			log.error("An error has occurred while update collaborator informations. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true })
	@ControllerLog()
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const id = req.params.id;
			await this.deleteCollaboratorService.execute(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Colaborador deletado com sucesso" });
		} catch (error) {
			log.error("An error has occurred while delete collaborator. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/stats/:collaboratorId", { authenticated: true })
	@ControllerLog()
	public async getCollaboratorStats(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user.id;
			const collaboratorId = req.params.collaboratorId;
			const stats = await this.findCollaboratorService.getCollaboratorStats(collaboratorId, userId);
			return res.status(HttpStatusCode.Ok).json({ message: "Estatísticas do colaborador carregadas com sucesso", payload: stats });
		} catch (error) {
			log.error("An error has occurred while get collaborator stats. ERROR: ", error);
			next(error);
		}
	}
}
