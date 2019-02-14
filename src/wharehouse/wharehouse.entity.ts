import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PackageEntity } from '../package/package.entity';
import { TruckEntity } from '../truck/truck.entity';

@Entity('wharehouse')
export class WharehouseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  address: string;

  @Column({default: 0})
  limit: number;

  @OneToMany(type => PackageEntity, pckage => pckage.wharehouse)
  packages: PackageEntity[];

  @OneToMany(type => TruckEntity, truck => truck.wharehouse)
  trucks: TruckEntity[];
}
