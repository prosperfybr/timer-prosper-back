import { log } from "@config/Logger";
import { UserResponseDTO } from "../dto/user-response.dto";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { UserRepository } from "../users.repository";
import { UserEntity } from "../user.entity";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { Service } from "@shared/decorators/service.decorator";

@Service()
export class FindUserService {

  constructor(private readonly userReposiory: UserRepository) {}

  public async getUser(id: string): Promise<UserResponseDTO> {
    if (!id) {
      log.error(`User ID is required, but is received: [${id}]`);
      throw new InvalidArgumentException("O ID do usuário é obrigatório");
    }

    const user: UserEntity = await this.userReposiory.findById(id);

    if (!user) {
      log.error(`User not found with ID: [${id}]`);
      throw new BadRequestException("Usuário não encontrado com o ID informado");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      establishments: user.establishments
    } as UserResponseDTO;
  }

  public async getAllUsers(): Promise<UserResponseDTO[]> {
    const users: UserEntity[] =  await this.userReposiory.findAll();
    return users.map(user => ({ id: user.id, name: user.name, email: user.email, role: user.role, establishments: user.establishments }));
  }
}