import { EstablishmentEntity } from "@modules/establishment/establishment.entity";
import { ServiceTypeEntity } from "@modules/servicetype/servicetype.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("services")
export class ServicesEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ length: 100, nullable: false, comment: "Nome do serviço" })
  public name: string;

  @Column({ type: 'text', nullable: true, comment: "Descrição do serviço" })
  public description: string;

  @Column({ type: 'integer', nullable: false, comment: "Preço salvo em centavos" })
  public price: number;

  @Column({ type: 'integer', nullable: false, comment: "Duração de execução do serviço" })
  public duration: number;

  @Column({ type: "uuid", name: "service_type_id", nullable: false })
  public serviceTypeId: string;

  @Column({ type: "uuid", name: "establishment_id", nullable: false })
  public establishmentId: string;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @UpdateDateColumn({ name: "updated_at"})
  public updatedAt: Date;

  @ManyToOne(() => ServiceTypeEntity, serviceType => serviceType.services)
  @JoinColumn({ name: "service_type_id"})
  public serviceType: ServiceTypeEntity;

  @ManyToOne(() => EstablishmentEntity, establishment => establishment.services)
  @JoinColumn({ name: "establishment_id" })
  public establishment: EstablishmentEntity;
}