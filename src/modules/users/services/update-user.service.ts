import { log } from "@config/Logger";
import { UpdateUserDTO } from "../dto/update-user.dto";
import { UserResponseDTO } from "../dto/user-response.dto";
import { UserEntity } from "../user.entity";
import { UserRepository } from "../users.repository";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { UpdateResult } from "typeorm";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { Service } from "@shared/decorators/service.decorator";

@Service()
export class UpdateUserService {
  
  constructor(
    //- Repositories
    private readonly userRepository: UserRepository,
    //- Utils
    private readonly validatorUtils: ValidatorUtils) {}

  public async execute(id: string, userToUpdate: UpdateUserDTO): Promise<UserResponseDTO> {
    const user: UserEntity = await this.userRepository.findById(id);

    if (!user) {
      log.error(`User not found with id. ID [${id}]`);
      throw new BadRequestException("Usuário não encontrado");
    }

    if (userToUpdate.userId = user.id) {
      log.debug(`The user wishes to update their own profile`);
      const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(user, userToUpdate);

      if (Object.keys(fieldsToUpdate).length === 0) {
        log.warn(`Nothing to update for user [${user.email}]`);
        throw new BadRequestException("Não há nenhuma informação do usuário para atualizar");
      }

      const result: UpdateResult = await this.userRepository.update(user.id, fieldsToUpdate);
      return null;
    } else {
      log.debug(`Another user wants to update this user`);
      if (!userToUpdate.userId) {
        log.error("Other user ID is invalid");
        throw new InvalidArgumentException("ID do outro usuário inválido");
      }

      const fieldsToUpdate = this.validatorUtils.filterUpdatedFields(user, userToUpdate);

      if (Object.keys(fieldsToUpdate).length === 0) {
        log.warn(`Nothing to update for user [${user.email}]`);
        throw new BadRequestException("Não há nenhuma informação do usuário para atualizar");
      }

      const result: UpdateResult = await this.userRepository.update(user.id, fieldsToUpdate);
      return null;
    }
  }
}