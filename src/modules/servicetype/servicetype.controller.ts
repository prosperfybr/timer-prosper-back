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
import { CreateServiceTypeDTO } from "./dto/create-service-type.dto";
import { ServiceTypeResponseDTO } from "./dto/service-type-response.dto";
import { UpdateServiceTypeDTO } from "./dto/update-service-type.dto";
import { CreateServiceTypeService } from "./services/create-service-type.service";
import { DeleteServiceTypeService } from "./services/delete-service-type.service";
import { FindServiceTypeService } from "./services/find-service-type.service";
import { UpdateServiceTypeService } from "./services/update-service-type.service";

@RequestMapping("service-type")
@RestController()
export class ServiceTypeController {
	constructor(
		private readonly createServiceTypeService: CreateServiceTypeService,
		private readonly findServiceTypeService: FindServiceTypeService,
		private readonly updateServiceTypeService: UpdateServiceTypeService,
		private readonly deleteServiceTypeService: DeleteServiceTypeService
	) {}

	@PostMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Creating a new service type");
			const payload: CreateServiceTypeDTO = req.body;
			const serviceType: ServiceTypeResponseDTO = await this.createServiceTypeService.execute(payload);
			log.info("Service type created successfull");
			return res.status(HttpStatusCode.Created).json({ message: "Tipo de serviço criado com sucesso", payload: serviceType });
		} catch (error) {
			log.error("An error has occurred while create a new service type. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/detail/:id", { authenticated: true })
	public async findById(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Finding a service type by id");
			const id: string = req.params.id;
			const serviceType: ServiceTypeResponseDTO = await this.findServiceTypeService.findById(id);
			log.info("Service type founded successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Tipo de serviço detalhado com sucesso", payload: serviceType });
		} catch (error) {
			log.error("An error has occurred while find a service type. ERROR:  ", error);
			next(error);
		}
	}

	@GetMapping("", { authenticated: true })
	public async findAll(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("List all services type");
			const servicesType: ServiceTypeResponseDTO[] = await this.findServiceTypeService.findAll();
			log.info("Services type is listed successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Tipos de serviço listados com sucesso.", payload: servicesType });
		} catch (error) {
			log.error("An error has occurred while list all services type. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/establishment/:establishmentId", { authenticated: true })
	public async findByEstablishment(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Listing all services type by establishment");
			const establishmentId: string = req.params.establishmentId;
			const servicesType: ServiceTypeResponseDTO[] = await this.findServiceTypeService.findByEstablishment(establishmentId);
			log.info("All services type by establishment is listed successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Tipos de serviços do estabelecimento listados com sucesso.", payload: servicesType });
		} catch (error) {
			log.error("An error has occurred while listing service types by establishment.ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Updating service type");
			const payload: UpdateServiceTypeDTO = req.body;
			await this.updateServiceTypeService.udpdate(payload);
			log.info("Service type udpated successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Tipo de serviço atualizado com sucesso.", payload: null });
		} catch (error) {
			log.error("An error has occurred while updating a service type. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Deleting service type");
			const id: string = req.params.id;
			await this.deleteServiceTypeService.delete(id);
			log.info("Service type deleted successfully");
			return res.status(HttpStatusCode.Ok).json({ message: "Tipo de serviço deletado com sucesso" });
		} catch (error) {
			log.error("An error has occurred while deleting service type. ERROR: ", error);
			next(error);
		}
	}
}
