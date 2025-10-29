import { EstablishmentEntity } from "@modules/establishment/establishment.entity";
import { ServiceTypeEntity } from "@modules/servicetype/servicetype.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("segments")
export class SegmentEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ length: 100, nullable: false, unique: true })
  public name: string;

  @Column({ name: "is_active", type: "boolean", nullable: false })
  public isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;

  @OneToMany(() => EstablishmentEntity, establishment => establishment.segment)
  public establishments: EstablishmentEntity[];

  @OneToMany(() => ServiceTypeEntity, serviceType => serviceType.segment)
  public serviceTypes: ServiceTypeEntity[];
}