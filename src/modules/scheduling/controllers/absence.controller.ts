import { log } from "@config/Logger";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { CreateAbsenceBlockService } from "../services/create-absence.service";
import { CreateAbsenceBlockDTO } from "../models/dto/create-absence-block.dto";
import { FindAbsenceBlockService } from "../services/find-absence.service";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RolesEnum } from "@modules/users/models/enum/roles.enum";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";

@RequestMapping("/absence")
@RestController()
export class AbsenceController {

  constructor(
    private readonly createService: CreateAbsenceBlockService,
    private readonly findService: FindAbsenceBlockService
  ) {}

  @PostMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER]})
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Creating a new absence");
      const payload: CreateAbsenceBlockDTO = req.body as CreateAbsenceBlockDTO;
      const absence = await this.createService.execute(payload);
      log.info("Absence created successfully");
      return res.status(HttpStatusCode.Created).json({ message: "Ausência criada com sucesso", payload: absence });
    } catch (error) {
      log.error("An error has occurred while create a new absence. ERROR: ", error);
      next(error);
    }
  }

  @GetMapping("/:establishmentId", { authenticated: true })
  public async find(req: Request, res: Response, next: NextFunction) {
    try {
      log.info(`Finding all absences by establishment`);
      const establishmentId: string = req.params.establishmentId;
      const absences = await this.findService.find(establishmentId);
      log.info(`All absences founded by establishment`);
      return res.status(HttpStatusCode.Ok).json({ message: "Ausências do estabelecimento listadas com sucesso", payload: absences });
    } catch (error) {
      log.error("An error has occurred while find a establishments absences. ERROR: ", error);
      next(error);
    }
  }

  @DeleteMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Deleting an establishment absence");
      log.info("Establishment absence deleted successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Ausência deletada co sucesso"})
    } catch (error) {
      log.error("An error has ocurred while delete an establishment absence. ERROR: ", error);
      next(error);
    }
  }
}