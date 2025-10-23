import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { UserRepository } from "../users.repository";
import { UserEntity } from "../user.entity";
import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";

@Service()
export class DeleteUserService {
  
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(id: string): Promise<void> {
    if (!id) {
      log.error(`User id is required, but id is: [${id}]`);
      throw new InvalidArgumentException("O ID do usuário é obrigatório");
    }

    const user: UserEntity = await this.userRepository.findById(id);

    if (!user) {
      log.error(`User not found with id: [${id}]`);
      throw new InvalidArgumentException("Usuário não encontrado com o id informado");
    }

    await this.userRepository.delete(id);
  }
}