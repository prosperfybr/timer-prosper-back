import { log } from "@config/Logger";
import { ClientEstablishmentResponseDTO } from "@modules/establishment/models/dto/establishment/client-establishment-response.dto";
import { InviteEstablishmentDTO } from "@modules/establishment/models/dto/invite/invite-establishment.dto";
import { RespondInviteDTO } from "@modules/establishment/models/dto/invite/respond-invite.dto";
import { FindClientEstablishmentService } from "@modules/establishment/services/find-client-establishment.service";
import { InviteService } from "@modules/establishment/services/invite.service";
import { RolesEnum } from "@modules/users/models/enum/roles.enum";
import { ControllerLog } from "@shared/decorators/logs/controller.decorator";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { PatchMapping } from "@shared/decorators/router/patch-mapping.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";

@RequestMapping("client")
@RestController()
export class ClientController {
	constructor(
		private readonly findClientEstablishmentService: FindClientEstablishmentService,
		private readonly inviteService: InviteService,
	) {}

	@GetMapping("/establishments/:clientId", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.CLIENT] })
	@ControllerLog()
	public async getEstablishmentClients(req: Request, res: Response, next: NextFunction) {
		try {
			const clientId: string = req.params.clientId;
			const clients: ClientEstablishmentResponseDTO[] = await this.findClientEstablishmentService.findEstablishmentsClient(clientId);
			return res.status(HttpStatusCode.Ok).json({
				message: "Clientes do estabelecimento listados com sucesso",
				payload: clients,
			});
		} catch (error) {
			log.error("An error has occurred while find all establishment clients. ERROR: ", error);
			next(error);
		}
	}

	@PostMapping("/add/establishment")
	@ControllerLog()
	public async addEstablishment(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: InviteEstablishmentDTO = req.body;
			const invite: ClientEstablishmentResponseDTO = await this.inviteService.establishment(payload);
			return res.status(HttpStatusCode.Created).json({ message: "Convite enviado para o estabelecimento.", payload: invite });
		} catch (error) {
			log.error("An error has occurred while assign client to establishment. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/remove/establishment/:relationshipId", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.CLIENT] })
	@ControllerLog()
	public async removeEstablishmentRelationship(req: Request, res: Response, next: NextFunction) {
		try {
			const relationshipId: string = req.params.relationshipId;
			await this.inviteService.removeEstablishmentRelationship(relationshipId);
			return res.status(HttpStatusCode.Ok).json({ message: "Relacionamento removido com sucesso." });
		} catch (error) {
			log.error("An error has occurred while remove establishment relationship. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("/respond/invite", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.CLIENT] })
	@ControllerLog()
	public async respondInvite(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: RespondInviteDTO = req.body;
			const inviteResponse: ClientEstablishmentResponseDTO = await this.inviteService.respond(payload);
			return res.status(HttpStatusCode.Ok).json({ message: "Convite do estabelecimento respondido com sucesso.", payload: inviteResponse });
		} catch (error) {
			log.error("An error has occurred while respond a establishment invite. ERROR: ", error);
			next(error);
		}
	}
}
