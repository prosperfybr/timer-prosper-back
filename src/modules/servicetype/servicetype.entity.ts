import { ServicesEntity } from "@modules/services/services.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("service_types")
export class ServiceTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ length: 100, nullable: false, unique: true })
  public name: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;

  @OneToMany(() => ServicesEntity, services => services.serviceType)
  services: ServicesEntity[];
}