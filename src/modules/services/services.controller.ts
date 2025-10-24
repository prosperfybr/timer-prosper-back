import { log } from "@config/Logger";
import { RolesEnum } from "@modules/users/dto/RolesEnum";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { NextFunction, Request, Response } from "express";
import { CreateServiceDTO } from "./dto/create-service.dto";
import { CreateServiceService } from "./services/create-service.service";
import { ServiceResponseDTO } from './dto/service-response.dto';
import { HttpStatusCode } from "axios";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { FindServiceService } from './services/find-service.service';
import { ServiceRequestFilter } from "./dto/services-request-filter.dto";
import { PatchMapping } from "@shared/decorators/router/patch-mapping.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { UpdateServiceDTO } from "./dto/update-service.dto";
import { UpdateServiceService } from "./services/update-service.service";
import { DeleteServiceService } from "./services/delete-service.service";

@RequestMapping("services")
@RestController()
export class ServicesController {

  constructor(
    private readonly createServiceService: CreateServiceService,
    private readonly findServiceService: FindServiceService,
    private readonly updateServiceService: UpdateServiceService,
    private readonly deleteServiceService: DeleteServiceService
  ) {}

  @PostMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Request received to create a new service");
      const service: CreateServiceDTO = req.body as CreateServiceDTO;
      const serviceCreated: ServiceResponseDTO = await this.createServiceService.execute(service);
      log.info("New service created successfully");
      return res.status(HttpStatusCode.Created).json({
        message: "Serviço criado com sucessso",
        payload: serviceCreated
      })
    } catch (error) {
      log.error("An error has occurred while create a new service. ERROR: ", error);
      next(error);
    }
  }

  @GetMapping("/detail/:id", { authenticated: true })
  public async find(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Finding a service by id");
      const id: string = req.params.id;
      const service: ServiceResponseDTO = await this.findServiceService.findServiceById(id);
      log.info("Finding a service by id");
      return res.status(HttpStatusCode.Ok).json({ message: "Serviço detalhado com sucesso", payload: service });
    } catch (error) {
      log.error("An error has occurred while find a service. ERROR: ", error);
      next(error);
    }
  }

  @GetMapping("", { authenticated: true })
  public async filter(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Filter a service");
      const filters = req.query as unknown as ServiceRequestFilter;
      const paginatedServices = await this.findServiceService.findService(filters);
      log.info("Services filtered successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Serviços filtrados com sucesso", payload: paginatedServices });
    } catch (error) {
      log.error("An error has occurred while filter services. ERROR: ", error);
      next(error);
    }
  }

  @PatchMapping("", { authenticated: true })
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Updating service");
      const payload: UpdateServiceDTO = req.body;
      await this.updateServiceService.execute(payload);
      log.info("Service updated successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Serviço atualizado com sucesso", payload: null });
    } catch (error) {
      log.error("An error has occurred while update a service. ERROR: ", error);
      next(error);
    }
  }

  @DeleteMapping("/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Deleting a service");
      const id: string = req.params.id;
      await this.deleteServiceService.delete(id);
      log.info("Service deleted successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Serviço deletado com sucesso"});
    } catch (error) {
      log.error("An error has occurred while delete a service. ERROR: ", error);
      next(error);
    }
  }

  @DeleteMapping("/:ids", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
  public async deletMany(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Deleting a service");
      const ids: string = req.params.ids;
      await this.deleteServiceService.delete(ids);
      log.info("Service deleted successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Serviço deletado com sucesso"});
    } catch (error) {
      log.error("An error has occurred while delete a service. ERROR: ", error);
      next(error);
    }
  }
}