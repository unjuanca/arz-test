import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
import { PackageEntity } from '../package/package.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity('truck')
export class TruckEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @ManyToOne(type => WharehouseEntity, wharehouse => wharehouse.trucks)
  wharehouse: WharehouseEntity;

  @OneToMany(type => PackageEntity, pckage => pckage.truck)
  packages: PackageEntity[];

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  created: Date;

}
