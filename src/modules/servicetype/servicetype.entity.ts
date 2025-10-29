import { SegmentEntity } from "@modules/segment/segment.entity";
import { ServicesEntity } from "@modules/services/services.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
  public services: ServicesEntity[];

  @Column({ name: "segment_id", type: "uuid", nullable: false })
  public segmentId: string;

  @ManyToOne(() => SegmentEntity, segment => segment.establishments)
  @JoinColumn({ name: "segment_id" })
  public segment: SegmentEntity;
}