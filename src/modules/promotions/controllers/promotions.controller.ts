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
import { CreatePromotionDTO } from "../models/dto/create-promotion.dto";
import { UpdatePromotionDTO } from "../models/dto/update-promotion.dto";
import { CreatePromotionService } from "../services/create-promotion.service";
import { DeletePromotionService } from "../services/delete-promotion.service";
import { FindPromotionsService } from "../services/find-promotions.service";
import { UpdatePromotionService } from "../services/update-promotion.service";
import { ControllerLog } from "@shared/decorators/logs/controller.decorator";

@RequestMapping("promotions")
@RestController()
export class PromotionsController {
	constructor(
		private readonly findPromotionsService: FindPromotionsService,
		private readonly createPromotionService: CreatePromotionService,
		private readonly updatePromotionService: UpdatePromotionService,
		private readonly deletePromotionService: DeletePromotionService,
	) {}

	@PostMapping("", { authenticated: true, roles: [RolesEnum.OWNER] })
	@ControllerLog()
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: CreatePromotionDTO = req.body;
			const promotion = await this.createPromotionService.execute(payload);
			return res.status(HttpStatusCode.Created).json({ message: "Promoção criada com sucesso", payload: promotion });
		} catch (error) {
			log.error("Error creating promotion:", error);
			next(error);
		}
	}

	@GetMapping("/establishment/:establishmentId", { authenticated: true, roles: [RolesEnum.OWNER, RolesEnum.COLLABORATOR] })
	@ControllerLog()
	public async findAll(req: Request, res: Response, next: NextFunction) {
		try {
			const establishmentId = req.params.establishmentId as string;
			const promotions = await this.findPromotionsService.findAll(establishmentId);
			return res.status(HttpStatusCode.Ok).json({ message: "Promoções listadas com sucesso", payload: promotions });
		} catch (error) {
			log.error("Error fetching promotions:", error);
			next(error);
		}
	}

	@GetMapping("/active/:establishmentId", { authenticated: false })
	@ControllerLog()
	public async findActive(req: Request, res: Response, next: NextFunction) {
		try {
			const establishmentId = req.params.establishmentId as string;
			const promotions = await this.findPromotionsService.findActive(establishmentId);
			return res.status(HttpStatusCode.Ok).json({ message: "Promoções ativas listadas com sucesso", payload: promotions });
		} catch (error) {
			log.error("Error fetching active promotions:", error);
			next(error);
		}
	}

	@PatchMapping("/:id", { authenticated: true, roles: [RolesEnum.OWNER] })
	@ControllerLog()
	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const id = req.params.id as string;
			const payload: UpdatePromotionDTO = req.body;
			const promotion = await this.updatePromotionService.execute(id, payload);
			return res.status(HttpStatusCode.Ok).json({ message: "Promoção atualizada com sucesso", payload: promotion });
		} catch (error) {
			log.error("Error updating promotion:", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true, roles: [RolesEnum.OWNER] })
	@ControllerLog()
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const id = req.params.id as string;
			await this.deletePromotionService.execute(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Promoção desativada com sucesso" });
		} catch (error) {
			log.error("Error deleting promotion:", error);
			next(error);
		}
	}
}
