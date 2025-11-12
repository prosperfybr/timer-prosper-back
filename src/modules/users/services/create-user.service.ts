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
import { UserPreferencesRepository } from "../user-preferences.repository";
import { UserPreferencesEntity } from '../user-preferences.entity';
import { FormatterUtils } from "@shared/utils/formatter.utils";

@Service()
export class CreateUserService {
  
  constructor(
    //- Repositories
    private readonly userRepository: UserRepository,
    private readonly userPreferencesRepository: UserPreferencesRepository,
    //- Utils
    private readonly validatorUtils: ValidatorUtils,
    private readonly formatterUtils: FormatterUtils
  ) {}

  public async execute(user: CreateUserDTO): Promise<UserResponseDTO> {
    const { name, email, password, cpf, role: newUserRole } = user;
    //- Validate user informations
    this.validate(name, email, password, cpf);
    //- Create user object to save
    const userToSave: UserEntity = new UserEntity();
    userToSave.email = email;
    userToSave.name = name;
    userToSave.password = await hash(password, 10);
    userToSave.role = newUserRole ? newUserRole : RolesEnum.CLIENT;
    userToSave.cpf = cpf ? this.formatterUtils.removeCPFMask(cpf) : null;

    let id: string = null;
    let role: any = null;
    try {
      const { id: userCreatedId, role: userCreatedRole }: UserEntity = await this.userRepository.save(userToSave);
      id = userCreatedId;
      role = userCreatedRole;
    } catch (error) {
      log.error(`An error has occurred while save user [${email}]. DATABASE ERROR: `, error);
      throw new BadRequestException("Usuário já cadastrado");
    }

    //- Create user preferences
    const preferences: UserPreferencesEntity = new UserPreferencesEntity();
    preferences.userId = id;
    preferences.darkMode = false;
    preferences.emailNotifications = true;
    preferences.whatsappNotifications = true;

    await this.userPreferencesRepository.save(preferences);

    return {
      id,
      name,
      email,
      role
    } as UserResponseDTO;
  }

  private validate(name: string, email: string, password: string, cpf: string): void {
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

      if ((cpf !== null && cpf !== undefined) && !this.validatorUtils.validateCPF(cpf)) {
          log.error(`The user CPF is invalid. CPF: [${cpf}]`);
          throw new BadRequestException("O CPF informado pelo usuário é inválido");
      }
  }
}