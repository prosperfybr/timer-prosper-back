import { log } from "@config/Logger";
import { ClientEstablishmentResponseDTO } from "@modules/establishment/models/dto/establishment/client-establishment-response.dto";
import { InviteClientDTO } from "@modules/establishment/models/dto/invite/invite-client.dto";
import { RespondInviteDTO } from "@modules/establishment/models/dto/invite/respond-invite.dto";
import { FindClientEstablishmentService } from "@modules/establishment/services/find-client-establishment.service";
import { InviteService } from "@modules/establishment/services/invite.service";
import { RolesEnum } from "@modules/users/models/enum/roles.enum";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { PatchMapping } from "@shared/decorators/router/patch-mapping.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { CreateEstablishmentDTO } from "../models/dto/establishment/create-establishment.dto";
import { EstablishmentResponseDTO } from "../models/dto/establishment/establishment-response.dto";
import { UpdateEstablishmentDTO } from "../models/dto/establishment/update-establishment.dto";
import { CreateEstablishmentService } from "../services/create-establishment.service";
import { DeleteEstablishmentService } from "../services/delete-establishment.service";
import { FindEstablishmentService } from "../services/find-establishment.service";
import { UpdateEstablishmentService } from "../services/update-establishment.service";
import { ControllerLog } from "@shared/decorators/logs/controller.decorator";

@RequestMapping("establishment")
@RestController()
export class EstablishmentController {
	constructor(
		private readonly createEstablishmentService: CreateEstablishmentService,
		private readonly findEstablishmentService: FindEstablishmentService,
		private readonly deleteEstablishmentService: DeleteEstablishmentService,
		private readonly updateEstablishmentService: UpdateEstablishmentService,
		//- Clients
		private readonly findClientEstablishmentService: FindClientEstablishmentService,
		//- Invites
		private readonly inviteService: InviteService
	) {}

	@PostMapping("")
	@ControllerLog()
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: CreateEstablishmentDTO = req.body;
			const establishment: EstablishmentResponseDTO = await this.createEstablishmentService.execute(payload);
			return res.status(HttpStatusCode.Created).json({ message: "Estabelecimento criado com sucesso.", payload: establishment });
		} catch (error) {
			log.error("An error has occurred while create a new establishment. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/detail/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER, RolesEnum.CLIENT, RolesEnum.COLLABORATOR] })
	@ControllerLog()
	public async findEstablishmentById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id;
			const establishment: EstablishmentResponseDTO = await this.findEstablishmentService.findById(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimento detalhado com sucesso", payload: establishment });
		} catch (error) {
			log.error("An error has occurred while find a establishment. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/all", { authenticated: true, roles: [RolesEnum.ADMIN] })
	@ControllerLog()
	public async findAllEstablishments(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id;
			const establishments: EstablishmentResponseDTO[] = await this.findEstablishmentService.findAll();
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimentos listados com sucesso", payload: establishments });
		} catch (error) {
			log.error("An error has occurred while find all establishments. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/all/owner", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async findAllOwnerEstablishments(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.user.id;
			const establishments: EstablishmentResponseDTO[] = await this.findEstablishmentService.findAllByUser(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimentos listados com sucesso", payload: establishments });
		} catch (error) {
			log.error("An error has occurred while find all establishments owner. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/filter", { authenticated: true })
	@ControllerLog()
	public async filterEstablishments(req: Request, res: Response, next: NextFunction) {
		try {
			const identifier: string = (req.query.code as string) || (req.query.name as string);
			const establishments: EstablishmentResponseDTO[] = await this.findEstablishmentService.filterEstablishmentByIdentifier(identifier);
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimentos filtrados com sucesso.", payload: establishments });
		} catch (error) {
			log.error("An error has occurred while filter establishments. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/clients/:establishmentId", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER, RolesEnum.COLLABORATOR] })
	@ControllerLog()
	public async getEstablishmentClients(req: Request, res: Response, next: NextFunction) {
		try {
			const establishmentId: string = req.params.establishmentId;
			const clients: ClientEstablishmentResponseDTO[] = await this.findClientEstablishmentService.findClientsEstablishment(establishmentId);
			return res.status(HttpStatusCode.Ok).json({ message: "Clientes do estabelecimento listados com sucesso", payload: clients });
		} catch (error) {
			log.error("An error has occurred while find all establishment clients. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id;
			await this.deleteEstablishmentService.delete(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimento deletado com sucesso." });
		} catch (error) {
			log.error("An error has occurred while delete a establishment. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: UpdateEstablishmentDTO = req.body;
			const establishment: EstablishmentResponseDTO = await this.updateEstablishmentService.execute(payload);
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimento atualizado com sucesso", payload: establishment });
		} catch (error) {
			log.error("An error has occurred while updating a establishment. ERROR: ", error);
			next(error);
		}
	}

	@PostMapping("/add/client", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async addClient(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: InviteClientDTO = req.body;
			const invite: ClientEstablishmentResponseDTO = await this.inviteService.client(payload);
			return res.status(HttpStatusCode.Created).json({ message: "Cliente convidado com sucesso.", payload: invite });
		} catch (error) {
			log.error("An error has occurred while assign client to establishment. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("/respond/invite", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async respondInvite(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: RespondInviteDTO = req.body;
			const inviteResponse: ClientEstablishmentResponseDTO = await this.inviteService.respond(payload);
			return res.status(HttpStatusCode.Ok).json({ message: "Convite do cliente respondido com sucesso.", payload: inviteResponse });
		} catch (error) {
			log.error("An error has occurred while respond a client invite. ERROR: ", error);
			next(error);
		}
	}
}
