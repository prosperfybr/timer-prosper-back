import { Repository, UpdateResult } from "typeorm";
import { AppDataSource } from "../../../ormconfig";
import { Repository as RepositoryDec } from "@shared/decorators/repository.decorator";
import { UserEntity } from "./user.entity";
import { EstablishmentEntity } from "@modules/establishment/establishment.entity";

@RepositoryDec()
export class UserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  /**
   * Salva um novo usuário no banco de dados
   * 
   * @param user Usuário que será salvo no banco de dados
   * @returns {UserEntity} Usuário salvo
   */
  public async save(user: UserEntity): Promise<UserEntity> {
    return await this.repository.save(user);
  }

  /**
   * Busca um usuário no banco de dados pelo ID
   * 
   * @param {string} id ID do usuário que será buscado no banco de dados
   * @returns {UserEntity} Usuário encontrado
   */
  public async findById(id: string): Promise<UserEntity> {
    return await this.repository.findOne({ where: { id }, relations: ['establishments'] });
  }

  public async findByEmail(email: string): Promise<UserEntity> {
    return await this.repository.findOne({ where: { email }});
  }

  public async findAll(): Promise<UserEntity[]> {
    return await this.repository.find();
  }

  public async update(id: string, data: Partial<UserEntity>): Promise<UpdateResult> {
    return await this.repository.update(id, data);
  }

  public async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  public async findUserEstablishments(id: string): Promise<EstablishmentEntity[]> {
    const userWithEstablishments: UserEntity = await this.repository.findOne({
      where: {id},
      relations: ['establishments'],
      order: { establishments: { tradeName: 'ASC' }},
    });

    if (!userWithEstablishments) return [];
    return userWithEstablishments.establishments;
  }
}