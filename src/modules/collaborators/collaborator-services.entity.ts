import { Column, Entity, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { CollaboratorEntity } from './collaborator.entity';

@Entity("collaborators_services")
export class CollaboratorsServicesEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ type: "uuid", name: "collaborator_id", nullable: false })
  public collaboratorId: string;

  @Column({ type: "uuid", name: "service_id", nullable: false })
  public serviceId: string;

  constructor(collaboratorId?: string, serviceId?: string) {
    this.collaboratorId = collaboratorId;
    this.serviceId = serviceId;
  }
}