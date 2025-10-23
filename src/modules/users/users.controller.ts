import { log } from "@config/Logger";
import { NextFunction, Request, Response } from "express";
import { CreateUserDTO } from "./dto/create-user.dto";
import { CreateUserService } from "./services/create-user.service";
import { HttpStatusCode } from "axios";
import { FindUserService } from "./services/find-user.service";
import { UserResponseDTO } from "./dto/user-response.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { UpdateUserService } from "./services/update-user.service";
import { DeleteUserService } from "./services/delete-user.service";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { GetMapping } from "@shared/decorators/router/get-mapping.decorator";
import { PatchMapping } from "@shared/decorators/router/patch-mapping.decorator";
import { DeleteMapping } from "@shared/decorators/router/delete-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";

@RequestMapping("users")
@RestController()
export class UserController {

  constructor(
    private readonly createUserService: CreateUserService,
    private readonly findUserService: FindUserService,
    private readonly updateUserService: UpdateUserService,
    private readonly deleteUserService: DeleteUserService
  ) {}

  /**
   * Método de criação de novos usuários
   * 
   * @param {Request} req Requisição recebida
   * @param {Response} res Resposta do método de criação
   * @param {NextFunction} next Em caso de erro, lança a exceção para o handler
   * 
   * @returns {Promise<Response<any, Record<string, any>>>} Retorna o novo usuário criado
   */
  @PostMapping("")
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Request received to create a new user");
      const user: CreateUserDTO = req.body as CreateUserDTO;
      const userCreated: UserResponseDTO = await this.createUserService.execute(user);
      log.info("New user created successfully");
      return res.status(HttpStatusCode.Created).json({ message: "Usuário criado com sucesso.", payload: userCreated });
    } catch (error) {
      log.error("An error has occurred while save a new user. ERROR: ", error);
      next(error);
    }
  }

  @GetMapping("/:id")
  public async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Finding user informations");
      const id: string = req.params["id"];
      const user: UserResponseDTO = await this.findUserService.getUser(id);
      log.info("User informations loaded successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Usuário encontrado com sucesso", payload: user });
    } catch (error) {
      log.error("An error has occurred while find user by id. ERROR: ", error);
      next(error);
    }
  }

  @GetMapping("/adm/all")
  public async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Finding all users");
      const users: UserResponseDTO[] = await this.findUserService.getAllUsers();
      log.info("All users founded");
      return res.status(HttpStatusCode.Ok).json({ message: "Usuários listados com sucesso", payload: users });
    } catch (error) {
      log.error("An eror has occurred while find all users. ERROR: ", error);
      next(error);
    }
  }

  @PatchMapping("")
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Updating user informations");
      const { id } = req.user;
      const userToUpdate: UpdateUserDTO = req.body as UpdateUserDTO;
      userToUpdate.userId = id;
      const userUpdated: UserResponseDTO = await this.updateUserService.execute(id, userToUpdate);
      log.info("User informations updated successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Cadastro do usuário atualizado com sucesso.", payload: userUpdated });
    } catch (error) {
      log.error("An error has occurred while update user informations. ERROR: ", error);
      next(error);
    }
  }

  @PatchMapping("/adm")
  public async updateOtherUser(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Updating other user informations");
      const { id } = req.user;
      const userToUpdate: UpdateUserDTO = req.body as UpdateUserDTO;
      const userUpdated: UserResponseDTO = await this.updateUserService.execute(id, userToUpdate);
      log.info("Other user informations updated successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Cadastro do usuário atualizado com sucesso.", payload: userUpdated });
    } catch (error) {
      log.error("An error has occurred while update user informations. ERROR: ", error);
      next(error);
    }
  }

  @DeleteMapping("/:id")
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      log.info("Excluding user");
      const id = req.params.id;
      await this.deleteUserService.execute(id);
      log.info("User deleted successfully");
      return res.status(HttpStatusCode.Ok).json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      log.error("An error has occurred while delete user. ERROR: ", error);
      next(error);
    }
  }
}
