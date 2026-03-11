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
import { CreatePlanDTO } from "../models/dto/create-plan.dto";
import { UpdatePlanDTO } from "../models/dto/update-plan.dto";
import { CreatePlanService } from "../services/create-plan.service";
import { DeletePlanService } from "../services/delete-plan.service";
import { FindPlanService } from "../services/find-plan.service";
import { FindPlansService } from "../services/find-plans.service";
import { UpdatePlanService } from "../services/update-plan.service";
import { ControllerLog } from "@shared/decorators/logs/controller.decorator";

@RequestMapping("plans")
@RestController()
export class PlansController {
	constructor(
		private readonly findPlansService: FindPlansService,
		private readonly findPlanService: FindPlanService,
		private readonly createPlanService: CreatePlanService,
		private readonly updatePlanService: UpdatePlanService,
		private readonly deletePlanService: DeletePlanService,
	) {}

	@GetMapping("", { authenticated: false })
	@ControllerLog()
	public async findAll(req: Request, res: Response, next: NextFunction) {
		try {
			const plans = await this.findPlansService.execute();
			return res.status(HttpStatusCode.Ok).json({ message: "Planos listados com sucesso", payload: plans });
		} catch (error) {
			log.error("An error has occurred while listing plans. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/:id", { authenticated: false })
	@ControllerLog()
	public async findById(req: Request, res: Response, next: NextFunction) {
		try {
			const id = req.params.id as string;
			const plan = await this.findPlanService.execute(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Plano detalhado com sucesso", payload: plan });
		} catch (error) {
			log.error("An error has occurred while finding plan. ERROR: ", error);
			next(error);
		}
	}

	@PostMapping("", { authenticated: true, roles: [RolesEnum.ADMIN] })
	@ControllerLog()
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: CreatePlanDTO = req.body;
			const plan = await this.createPlanService.execute(payload);
			return res.status(HttpStatusCode.Created).json({ message: "Plano criado com sucesso", payload: plan });
		} catch (error) {
			log.error("An error has occurred while creating plan. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("/:id", { authenticated: true, roles: [RolesEnum.ADMIN] })
	@ControllerLog()
	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const id = req.params.id as string;
			const payload: UpdatePlanDTO = req.body;
			const plan = await this.updatePlanService.execute(id, payload);
			return res.status(HttpStatusCode.Ok).json({ message: "Plano atualizado com sucesso", payload: plan });
		} catch (error) {
			log.error("An error has occurred while updating plan. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true, roles: [RolesEnum.ADMIN] })
	@ControllerLog()
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const id = req.params.id as string;
			await this.deletePlanService.execute(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Plano desativado com sucesso" });
		} catch (error) {
			log.error("An error has occurred while deleting plan. ERROR: ", error);
			next(error);
		}
	}
}
