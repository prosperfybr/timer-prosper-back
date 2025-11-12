import { log } from "@config/Logger";
import { UserResponseDTO } from "../dto/user-response.dto";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { UserRepository } from "../users.repository";
import { UserEntity } from "../user.entity";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { Service } from "@shared/decorators/service.decorator";
import { FindUserPreferencesService } from './find-user-preferences.service';
import { UserPreferencesResponseDTO } from "../dto/user-preferences-response.dto";
import { FormatterUtils } from "@shared/utils/formatter.utils";

@Service()
export class FindUserService {

  constructor(
    private readonly userReposiory: UserRepository,
    private readonly findUserPreferencesService: FindUserPreferencesService,
    //- Utils
    private readonly formatterUtils: FormatterUtils
  ) {}

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
    
    let settingsPreferences: UserPreferencesResponseDTO = null;
    try {
      settingsPreferences = await this.findUserPreferencesService.getPreferences(user.id);
    } catch (error) {
      settingsPreferences = {
        id: null,
        userId: user.id,
        darkMode: null,
        emailNotifications: null,
        whatsappNotifications: null
      };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      birthDate: user.birthDate,
      whatsApp: user.whatsApp,
      cpf: user.cpf ? this.formatterUtils.addCPFMask(user.cpf) : null,
      profileComplete: user.profileComplete,
      profilePreferences: user.profilePreferences,
      settingsPreferences,
      establishments: user.establishments
    } as UserResponseDTO;
  }

  public async getAllUsers(): Promise<UserResponseDTO[]> {
    const users: UserEntity[] =  await this.userReposiory.findAll();
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileComplete: user.profileComplete,
      establishments: user.establishments
    }));
  }
}