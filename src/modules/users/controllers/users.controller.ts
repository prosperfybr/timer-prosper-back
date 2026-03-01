import { log } from "@config/Logger";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { PatchMapping } from "@shared/decorators/router/patch-mapping.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { CreateUserDTO } from "../models/dto/create-user.dto";
import { UpdateUserPreferencesDTO } from "../models/dto/update-user-preferences.dto";
import { UpdateUserDTO } from "../models/dto/update-user.dto";
import { UserPreferencesResponseDTO } from "../models/dto/user-preferences-response.dto";
import { UserResponseDTO } from "../models/dto/user-response.dto";
import { RolesEnum } from "../models/enum/roles.enum";
import { CreateUserService } from "../services/create-user.service";
import { DeleteUserService } from "../services/delete-user.service";
import { FindUserPreferencesService } from "../services/find-user-preferences.service";
import { FindUserService } from "../services/find-user.service";
import { UpdateUserPreferencesService } from "../services/update-user-preferences.service";
import { UpdateUserService } from "../services/update-user.service";
import { ControllerLog } from "@shared/decorators/logs/controller.decorator";

@RequestMapping("users")
@RestController()
export class UserController {
	constructor(
		private readonly createUserService: CreateUserService,
		private readonly findUserService: FindUserService,
		private readonly updateUserService: UpdateUserService,
		private readonly deleteUserService: DeleteUserService,
		//- Preferences
		private readonly findUserPreferencesService: FindUserPreferencesService,
		private readonly updateUserPreferencesService: UpdateUserPreferencesService,
	) {}

	@PostMapping("", { validation: CreateUserDTO })
	@ControllerLog()
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const user: CreateUserDTO = req.body as CreateUserDTO;
			const userCreated: UserResponseDTO = await this.createUserService.execute(user);
			return res.status(HttpStatusCode.Created).json({ message: "Usuário criado com sucesso.", payload: userCreated });
		} catch (error) {
			log.error("An error has occurred while save a new user. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("", { authenticated: true })
	@ControllerLog()
	public async getUser(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.user;
			const user: UserResponseDTO = await this.findUserService.getUser(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Usuário encontrado com sucesso", payload: user });
		} catch (error) {
			log.error("An error has occurred while find user by id. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/adm/all", { authenticated: true, roles: [RolesEnum.ADMIN] })
	@ControllerLog()
	public async getAllUsers(req: Request, res: Response, next: NextFunction) {
		try {
			const users: UserResponseDTO[] = await this.findUserService.getAllUsers();
			return res.status(HttpStatusCode.Ok).json({ message: "Usuários listados com sucesso", payload: users });
		} catch (error) {
			log.error("An error has occurred while find all users. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/preferences", { authenticated: true })
	@ControllerLog()
	public async getUserPreferences(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.user;
			const preferences: UserPreferencesResponseDTO = await this.findUserPreferencesService.getPreferences(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Preferências do usuário encontrada com sucesso", payload: preferences });
		} catch (error) {
			log.error("An eror has occurred while find user preferences. ERROR: ", error);
			next(error);
		}
	}

	@GetMapping("/adm/stats", { authenticated: true, roles: [RolesEnum.ADMIN] })
	@ControllerLog()
	public async getAdminStats(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.user;
			const stats = await this.findUserService.getAdminStats(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Estatísticas administrativas carregadas com sucesso", payload: stats });
		} catch (error) {
			log.error("An error has occurred while get admin stats. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("", { authenticated: true })
	@ControllerLog()
	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.user;
			const userToUpdate: UpdateUserDTO = req.body as UpdateUserDTO;
			userToUpdate.userId = id;
			const userUpdated: UserResponseDTO = await this.updateUserService.execute(id, userToUpdate);
			return res.status(HttpStatusCode.Ok).json({ message: "Cadastro do usuário atualizado com sucesso.", payload: userUpdated });
		} catch (error) {
			log.error("An error has occurred while update user informations. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("/adm", { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async updateOtherUser(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.user;
			const userToUpdate: UpdateUserDTO = req.body as UpdateUserDTO;
			const userUpdated: UserResponseDTO = await this.updateUserService.execute(id, userToUpdate);
			return res.status(HttpStatusCode.Ok).json({ message: "Cadastro do usuário atualizado com sucesso.", payload: userUpdated });
		} catch (error) {
			log.error("An error has occurred while update user informations. ERROR: ", error);
			next(error);
		}
	}

	@PatchMapping("/preferences", { authenticated: true })
	@ControllerLog()
	public async updatePreferences(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.user;
			const preferencesToUpdate: UpdateUserPreferencesDTO = req.body as UpdateUserPreferencesDTO;
			const preferencesUpdated: UserPreferencesResponseDTO = await this.updateUserPreferencesService.execute(id, preferencesToUpdate);
			return res.status(HttpStatusCode.Ok).json({ message: "Preferências do usuário atualizadas com sucesso.", payload: preferencesUpdated });
		} catch (error) {
			log.error("An error has occurred while update user preferences. ERROR: ", error);
			next(error);
		}
	}

	@DeleteMapping("/:id", { authenticated: true })
	@ControllerLog()
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const id = req.params.id;
			await this.deleteUserService.execute(id);
			return res.status(HttpStatusCode.Ok).json({ message: "Usuário deletado com sucesso" });
		} catch (error) {
			log.error("An error has occurred while delete user. ERROR: ", error);
			next(error);
		}
	}
}
