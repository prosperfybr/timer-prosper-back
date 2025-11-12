import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { UserRepository } from "../users.repository";
import { UserEntity } from "../user.entity";
import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { UserPreferencesRepository } from "../user-preferences.repository";
import { UserPreferencesEntity } from "../user-preferences.entity";

@Service()
export class DeleteUserService {
  
  constructor(private readonly userRepository: UserRepository,
    private readonly userPreferencesRepository: UserPreferencesRepository
  ) {}

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

    const preferences: UserPreferencesEntity = await this.userPreferencesRepository.findByUserId(user.id);

    await this.userPreferencesRepository.delete(preferences.id);
    await this.userRepository.delete(id);
  }
}