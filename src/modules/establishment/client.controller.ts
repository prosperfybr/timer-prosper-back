import {RequestMapping} from "@shared/decorators/router/request-mapping.decorator";
import {RestController} from "@shared/decorators/restcontroller.decorator";
import {GetMapping} from "@shared/decorators/router/get-mapping.decorator";
import {Request, Response, NextFunction} from "express";
import {RolesEnum} from "@modules/users/dto/RolesEnum";
import {log} from "@config/Logger";
import {ClientEstablishmentResponseDTO} from "@modules/establishment/dto/client-establishment-response.dto";
import {HttpStatusCode} from "axios";
import {FindClientEstablishmentService} from "@modules/establishment/services/find-client-establishment.service";
import {PostMapping} from "@shared/decorators/router/post-mapping.decorator";
import {InviteEstablishmentDTO} from "@modules/establishment/dto/invite-establishment.dto";
import {InviteService} from "@modules/establishment/services/invite.service";
import {PatchMapping} from "@shared/decorators/router/patch-mapping.decorator";
import {RespondInviteDTO} from "@modules/establishment/dto/respond-invite.dto";

@RequestMapping("client")
@RestController()
export class ClientController {

    constructor(
        private readonly findClientEstablishmentService: FindClientEstablishmentService,
        private readonly inviteService: InviteService
    ) {}

    @GetMapping("/establishments/:clientId", {authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.CLIENT]})
    public async getEstablishmentClients(req: Request, res: Response, next: NextFunction) {
        try {
            log.info("Findind all establishment clients");
            const clientId: string = req.params.clientId;
            const clients: ClientEstablishmentResponseDTO[] = await this.findClientEstablishmentService.findEstablishmentsClient(clientId);
            log.info("All establishment clients founded successfully");
            return res.status(HttpStatusCode.Ok).json({
                message: "Clientes do estabelecimento listados com sucesso",
                payload: clients
            });
        } catch (error) {
            log.error("An error has occurred while find all establishment clients. ERROR: ", error);
            next(error);
        }
    }

    @PostMapping("/add/establishment")
    public async addEstablishment(req: Request, res: Response, next: NextFunction) {
        try {
            log.info("Creating a request link between client to establishment");
            const payload: InviteEstablishmentDTO = req.body;
            const invite: ClientEstablishmentResponseDTO = await this.inviteService.establishment(payload);
            log.info("Request link created successfully");
            return res.status(HttpStatusCode.Created).json({ message: "Convite enviado para o estabelecimento.", payload: invite });
        } catch (error) {
            log.error("An error has occurred while assign client to establishment. ERROR: ", error);
            next(error);
        }
    }

    @PatchMapping("/respond/invite", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.CLIENT]})
    public async respondInvite(req: Request, res: Response, next: NextFunction) {
        try {
            log.info("Responding a establishment invite");
            const payload: RespondInviteDTO = req.body;
            const inviteResponse: ClientEstablishmentResponseDTO = await this.inviteService.respond(payload);
            log.info("Invite responded successfully");
            return res.status(HttpStatusCode.Ok).json({ message: "Convite do estabelecimento respondido com sucesso.", payload: inviteResponse });
        } catch (error) {
            log.error("An error has occurred while respond a establishment invite. ERROR: ", error);
            next(error);
        }
    }
}
