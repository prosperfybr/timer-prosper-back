import { log } from "@config/Logger";
import { CreateUserDTO } from "../dto/create-user.dto";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { UserEntity } from "../user.entity";
import { hash } from "bcryptjs";
import { RolesEnum } from "../dto/RolesEnum";
import { UserRepository } from "../users.repository";
import { UserResponseDTO } from "../dto/user-response.dto";
import { Service } from "@shared/decorators/service.decorator";

@Service()
export class CreateUserService {
  
  constructor(
    //- Repositories
    private readonly userRepository: UserRepository,
    //- Utils
    private readonly validatorUtils: ValidatorUtils
  ) {}

  public async execute(user: CreateUserDTO): Promise<UserResponseDTO> {
    const { name, email, password } = user;

    if (name.trim().length < 3) {
      log.error("User name is invalid");
      throw new BadRequestException("O nome do usuário é inválido.");
    }

    if (!this.validatorUtils.validateEmail(email)) {
      log.error("User email is invalid");
      throw new BadRequestException("O e-mail informado é inválido.");
    }

    if (!password) {
      log.error("Password is invalid");
      throw new BadRequestException("A senha é inválida.");
    }

    const userToSave: UserEntity = new UserEntity();
    userToSave.email = email;
    userToSave.name = name;
    userToSave.password = await hash(password, 10);
    userToSave.role = RolesEnum.CLIENT;

    const { id, role }: UserEntity = await this.userRepository.save(userToSave);

    return {
      id,
      name,
      email,
      role
    } as UserResponseDTO;
  }
}