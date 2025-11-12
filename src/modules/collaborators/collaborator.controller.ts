import { log } from "@config/Logger";
import { NextFunction, Request, Response } from "express";

import { HttpStatusCode } from "axios";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { PatchMapping } from "@shared/decorators/router/patch-mapping.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { CreateCollaboratorDTO } from "./dto/create-collaborator.dto";
import { CreateCollaboratorService } from "./services/create-collaborator.service";
import { RolesEnum } from "@modules/users/dto/RolesEnum";
import { CollaboratorResponseDTO } from "./dto/collaborator-response.dto";
import { FindCollaboratorService } from "./services/find-collaborator.service";
import { DeleteCollaboratorService } from "./services/delete-collaborator.service";
import { UpdateCollaboratorDTO } from "./dto/update-collaborator.dto";
import { UpdateCollaboratorService } from "./services/update-collaborator.service";

@RequestMapping("collaborator")
@RestController()
export class CollaboratorController {

  constructor(
    private readonly createCollaboratorService: CreateCollaboratorService,
    private readonly findCollaboratorService: FindCollaboratorService,
    private readonly updateCollaboratorService: UpdateCollaboratorService,
    private readonly deleteCollaboratorService: DeleteCollaboratorService,
  ) {}

  @PostMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER]})
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Request received to create a new collaborator");
      const collaborator: CreateCollaboratorDTO = req.body as CreateCollaboratorDTO;
      const collaboratorCreated: CollaboratorResponseDTO = await this.createCollaboratorService.execute(collaborator);
      log.info("New collaborator created successfully");
      return res.status(HttpStatusCode.Created).json({ message: "Colaborador criado com sucesso.", payload: collaboratorCreated });
    } catch (error) {
      log.error("An error has occurred while save a new collaborator. ERROR: ", error);
      next(error);
    }
  }

  @GetMapping("/:collaboratorId", { authenticated: true })
  public async getCollaborator(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Finding collaborator informations");
      const id = req.params.collaboratorId;
      const collaborator: CollaboratorResponseDTO = await this.findCollaboratorService.execute(id);
      log.info("Collaborator informations loaded successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Colaborador encontrado com sucesso", payload: collaborator });
    } catch (error) {
      log.error("An error has occurred while find collaborator by id. ERROR: ", error);
      next(error);
    }
  }

  @GetMapping("/all/establishment/:establishmentId", { authenticated: true })
  public async getAllEstablishmentCollaborators(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Finding all establishment collaborators");
      const establishmentId: string = req.params.establishmentId;
      const collaborators: CollaboratorResponseDTO[] = await this.findCollaboratorService.getAllEstablishmentCollaborators(establishmentId);
      log.info("All collaborators founded");
      return res.status(HttpStatusCode.Ok).json({ message: "Colaboradores do estabelecimento listados com sucesso", payload: collaborators });
    } catch (error) {
      log.error("An error has occurred while find all establishment collaborators. ERROR: ", error);
      next(error);
    }
  }

  @PatchMapping("", { authenticated: true })
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Updating collaborator informations");
      const userToUpdate: UpdateCollaboratorDTO = req.body as UpdateCollaboratorDTO;
      const collaboratorUpdated: CollaboratorResponseDTO = await this.updateCollaboratorService.execute(userToUpdate.id, userToUpdate);
      log.info("Collaborator informations updated successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Cadastro do colaborador atualizado com sucesso.", payload: collaboratorUpdated });
    } catch (error) {
      log.error("An error has occurred while update collaborator informations. ERROR: ", error);
      next(error);
    }
  }

  @PatchMapping("/toggle-status/:collaboratorId", { authenticated: true })
  public async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Toggle collaborator status");
      const id = req.params.collaboratorId;
      await this.updateCollaboratorService.toggleStatus(id);
      log.info("Collaborator informations updated successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Cadastro do colaborador atualizado com sucesso." });
    } catch (error) {
      log.error("An error has occurred while update collaborator informations. ERROR: ", error);
      next(error);
    }
  }

  @DeleteMapping("/:id", { authenticated: true })
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Excluding collaborator");
      const id = req.params.id;
      await this.deleteCollaboratorService.execute(id);
      log.info("Collaborator deleted successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Colaborador deletado com sucesso" });
    } catch (error) {
      log.error("An error has occurred while delete collaborator. ERROR: ", error);
      next(error);
    }
  }
}
