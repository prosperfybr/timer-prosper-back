import { log } from "@config/Logger";
import { RolesEnum } from "@modules/users/models/enum/roles.enum";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { CreateSubscriptionDTO } from "../models/dto/create-subscription.dto";
import { CreateSubscriptionService } from "../services/create-subscription.service";
import { ControllerLog } from "@shared/decorators/logs/controller.decorator";

@RequestMapping("subscriptions")
@RestController()
export class SubscriptionsController {
	constructor(private readonly createSubscriptionService: CreateSubscriptionService) {}

	@PostMapping("/subscribe")
	@ControllerLog()
	public async subscribe(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: CreateSubscriptionDTO = req.body;
			const subscription = await this.createSubscriptionService.execute(payload);
			return res.status(HttpStatusCode.Created).json({ 
				message: "Plano assinado com sucesso", 
				payload: subscription 
			});
		} catch (error) {
			log.error("Erro ao realizar assinatura:", error);
			next(error);
		}
	}
}
