import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RolesEnum } from "./dto/RolesEnum";
import { EstablishmentEntity } from "@modules/establishment/establishment.entity";

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

  @OneToMany(() => EstablishmentEntity, establishment => establishment.user)
  establishments: EstablishmentEntity[];
}