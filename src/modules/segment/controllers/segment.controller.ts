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
import { CreateSegmentDTO } from "../models/dto/create-segment.dto";
import { SegmentResponseDTO } from "../models/dto/segment-response.dto";
import { UpdateSegmentDTO } from "../models/dto/update-segment.dto";
import { CreateSegmentService } from "../services/create-segment.service";
import { DeleteSegmentService } from "../services/delete-segment.service";
import { FindSegmentService } from "../services/find-segment.service";
import { UpdateSegmentService } from "../services/update-segment.service";
import { ControllerLog } from "@shared/decorators/logs/controller.decorator";

@RequestMapping("/segments")
@RestController()
export class SegmentController {
	constructor(
		private readonly createSegmentService: CreateSegmentService,
		private readonly findSegmentService: FindSegmentService,
		private readonly updateSegmentService: UpdateSegmentService,
		private readonly deleteSegmentService: DeleteSegmentService,
	) {}

	@PostMapping("")
	@ControllerLog()
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: CreateSegmentDTO = req.body;
			const serviceType: SegmentResponseDTO = await this.createSegmentService.execute(payload);
			return res.status(HttpStatusCode.Created).json({ message: "Segmento criado com sucesso", payload: serviceType });
		} catch (error) {
			log.error("An error has occurred while create a new segment. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/detail/:id", { authenticated: true })
	@ControllerLog()
	public async findById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id;
			const serviceType: SegmentResponseDTO = await this.findSegmentService.findById(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Segmento detalhado com sucesso", payload: serviceType });
		} catch (error) {
			log.error("An error has occurred while find a segment. ERROR:  ", error);
			next(error);
		}
	}

	@GetMapping("")
	@ControllerLog()
	public async findAll(req: Request, res: Response, next: NextFunction) {
		try {
			const servicesType: SegmentResponseDTO[] = await this.findSegmentService.findAll();
			return res.status(HttpStatusCode.Ok).json({ message: "Segmentos listados com sucesso.", payload: servicesType });
		} catch (error) {
			log.error("An error has occurred while list all segments. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/actives")
	@ControllerLog()
	public async findActive(req: Request, res: Response, next: NextFunction) {
		try {
			const servicesType: SegmentResponseDTO[] = await this.findSegmentService.findAllActives();
			return res.status(HttpStatusCode.Ok).json({ message: "Segmentos ativos listados com sucesso.", payload: servicesType });
		} catch (error) {
			log.error("An error has occurred while listing segments active. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: UpdateSegmentDTO = req.body;
			await this.updateSegmentService.udpdate(payload);
			return res.status(HttpStatusCode.Ok).json({ message: "Segmento atualizado com sucesso.", payload: null });
		} catch (error) {
			log.error("An error has occurred while updating a segment. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id;
			await this.deleteSegmentService.delete(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Segmento deletado com sucesso" });
		} catch (error) {
			log.error("An error has occurred while deleting segment. ERROR: ", error);
			next(error);
		}
	}
}
