import { log } from "@config/Logger";
import { RolesEnum } from "@modules/users/models/enum/roles.enum";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { PatchMapping } from "@shared/decorators/router/patch-mapping.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { CreateServiceTypeDTO } from "../models/dto/create-service-type.dto";
import { ServiceTypeResponseDTO } from "../models/dto/service-type-response.dto";
import { UpdateServiceTypeDTO } from "../models/dto/update-service-type.dto";
import { CreateServiceTypeService } from "../services/create-service-type.service";
import { DeleteServiceTypeService } from "../services/delete-service-type.service";
import { FindServiceTypeService } from "../services/find-service-type.service";
import { UpdateServiceTypeService } from "../services/update-service-type.service";
import { ControllerLog } from "@shared/decorators/logs/controller.decorator";

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
	@ControllerLog()
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: CreateServiceTypeDTO = req.body;
			const serviceType: ServiceTypeResponseDTO = await this.createServiceTypeService.execute(payload);
			return res.status(HttpStatusCode.Created).json({ message: "Tipo de serviço criado com sucesso", payload: serviceType });
		} catch (error) {
			log.error("An error has occurred while create a new service type. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/detail/:id", { authenticated: true })
	@ControllerLog()
	public async findById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id;
			const serviceType: ServiceTypeResponseDTO = await this.findServiceTypeService.findById(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Tipo de serviço detalhado com sucesso", payload: serviceType });
		} catch (error) {
			log.error("An error has occurred while find a service type. ERROR:  ", error);
			next(error);
		}
	}

	@GetMapping("", { authenticated: true })
	@ControllerLog()
	public async findAll(req: Request, res: Response, next: NextFunction) {
		try {
			const servicesType: ServiceTypeResponseDTO[] = await this.findServiceTypeService.findAll();
			return res.status(HttpStatusCode.Ok).json({ message: "Tipos de serviço listados com sucesso.", payload: servicesType });
		} catch (error) {
			log.error("An error has occurred while list all services type. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/establishment/:establishmentId", { authenticated: true })
	@ControllerLog()
	public async findByEstablishment(req: Request, res: Response, next: NextFunction) {
		try {
			const establishmentId: string = req.params.establishmentId;
			const servicesType: ServiceTypeResponseDTO[] = await this.findServiceTypeService.findByEstablishment(establishmentId);
			return res.status(HttpStatusCode.Ok).json({ message: "Tipos de serviços do estabelecimento listados com sucesso.", payload: servicesType });
		} catch (error) {
			log.error("An error has occurred while listing service types by establishment.ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/segment/:segmentId", { authenticated: true })
	@ControllerLog()
	public async findBySegment(req: Request, res: Response, next: NextFunction) {
		try {
			const segmentId: string = req.params.segmentId;
			const servicesType: ServiceTypeResponseDTO[] = await this.findServiceTypeService.findBySegment(segmentId);
			return res.status(HttpStatusCode.Ok).json({ message: "Tipos de serviços do segmeto listados com sucesso.", payload: servicesType });
		} catch (error) {
			log.error("An error has occurred while listing services type by segment. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: UpdateServiceTypeDTO = req.body;
			await this.updateServiceTypeService.udpdate(payload);
			return res.status(HttpStatusCode.Ok).json({ message: "Tipo de serviço atualizado com sucesso.", payload: null });
		} catch (error) {
			log.error("An error has occurred while updating a service type. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id;
			await this.deleteServiceTypeService.delete(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Tipo de serviço deletado com sucesso" });
		} catch (error) {
			log.error("An error has occurred while deleting service type. ERROR: ", error);
			next(error);
		}
	}
}
