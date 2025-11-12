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
import {FindClientEstablishmentService} from "@modules/establishment/services/find-client-establishment.service";
import {ClientEstablishmentResponseDTO} from "@modules/establishment/dto/client-establishment-response.dto";
import {PutMapping} from "@shared/decorators/router/put-mapping.decorator";
import {InviteClientDTO} from "@modules/establishment/dto/invite-client.dto";
import {InviteService} from "@modules/establishment/services/invite.service";
import {ClientEstablishmentEntity} from "@modules/establishment/client-establishment.entity";
import {RespondInviteDTO} from "@modules/establishment/dto/respond-invite.dto";

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

	@GetMapping("/detail/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER, RolesEnum.CLIENT, RolesEnum.COLLABORATOR] })
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

	@GetMapping("/filter", { authenticated: true })
	public async filterEstablishments(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Filtering establishments by query");
			const identifier: string = req.query.code as string || req.query.name as string;
			const establishments: EstablishmentResponseDTO[] = await this.findEstablishmentService.filterEstablishmentByIdentifier(identifier);
			log.info("Establishments filtered successfully")
			return res.status(HttpStatusCode.Ok).json({ message: "Estabelecimentos filtrados com sucesso.", payload: establishments })
		} catch (error) {
			log.error("An error has occurred while filter establishments. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/clients/:establishmentId", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER ]})
	public async getEstablishmentClients(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Finding all establishment clients");
			const establishmentId: string = req.params.establishmentId;
			const clients: ClientEstablishmentResponseDTO[] = await this.findClientEstablishmentService.findClientsEstablishment(establishmentId);
			log.info("All establishment clients founded successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Clientes do estabelecimento listados com sucesso", payload: clients });
		} catch (error) {
			log.error("An error has occurred while find all establishment clients. ERROR: ", error);
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

	@PostMapping("/add/client", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER]})
	public async addClient(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Assigning a client to establishment");
			const payload: InviteClientDTO = req.body;
			const invite: ClientEstablishmentResponseDTO = await this.inviteService.client(payload);
			log.info("Client assigned to establishment");
			return res.status(HttpStatusCode.Created).json({ message: "Cliente convidado com sucesso.", payload: invite });
		} catch (error) {
			log.error("An error has occurred while assign client to establishment. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("/respond/invite", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER]})
	public async respondInvite(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Responding a client invite");
			const payload: RespondInviteDTO = req.body;
			const inviteResponse: ClientEstablishmentResponseDTO = await this.inviteService.respond(payload);
			log.info("Invite responded successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Convite do cliente respondido com sucesso.", payload: inviteResponse });
		} catch (error) {
			log.error("An error has occurred while respond a client invite. ERROR: ", error);
			next(error);
		}
	}
}
