import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { RolesEnum } from "./dto/RolesEnum";
import { EstablishmentEntity } from "@modules/establishment/establishment.entity";
import { UserPreferencesEntity } from "./user-preferences.entity";
import { CollaboratorEntity } from "@modules/collaborators/collaborator.entity";

@Entity("users")
export class UserEntity {

  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ nullable: false })
  public name: string;

  @Column({ unique: true, nullable: false })
  public email: string;

  @Column({ nullable: false })
  public password: string;

  @Column({ nullable: false })
  public role: RolesEnum;

  /** NEW FIELDS TO USER PROFILE **/
  @Column({ name: "whatsapp", type: "varchar", nullable: true })
  public whatsApp: string;

  @Column({ name: "birth_date", type: "date", nullable: true })
  public birthDate: Date;

  @Column({ type: "varchar", nullable: true })
  public cpf: string;

  @Column({ name: "preferences", type: "text", nullable: true })
  public profilePreferences: string;

  @Column({ name: "profile_complete", nullable: false, default: true })
  public profileComplete: boolean;
  /** NEW FIELDS TO USER PROFILE **/

  @OneToMany(() => EstablishmentEntity, establishment => establishment.user)
  establishments: EstablishmentEntity[];

  @OneToOne(() => UserPreferencesEntity, preferences => preferences.user)
  public preferences: UserPreferencesEntity;
}