import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "@modules/users/user.entity";
import { EstablishmentEntity } from "@modules/establishment/establishment.entity";

@Entity("collaborators")
export class CollaboratorEntity {

  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ type: "uuid", name: "user_id", nullable: false })
  public userId: string;

  @Column({ type: "uuid", name: "establishment_id", nullable: false })
  public establishmentId: string;

  @Column({ type: "varchar", name: "collaborator_function", unique: false, nullable: true })
  public collaboratorFunction: string;

  @Column({ type: "varchar", nullable: true })
  public specialty: string;

  @Column({ type: "date", name: "hiring_date", nullable: true })
  public hiringDate: Date;

  @Column({ type: "boolean", default: true })
  public active: boolean;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: "user_id" })
  public user: UserEntity;

  @ManyToOne(() => EstablishmentEntity, establishment => establishment.collaborators)
  @JoinColumn({ name: "establishment_id"})
  public establishment: EstablishmentEntity;
}