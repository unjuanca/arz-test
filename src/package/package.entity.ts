import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
import { TruckEntity } from '../truck/truck.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('package')
export class PackageEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  description: string;

  @ManyToOne(type => WharehouseEntity, wharehouse => wharehouse.packages, { nullable: true })
  wharehouse: WharehouseEntity;

  @ManyToOne(type => TruckEntity, truck => truck.packages, { nullable: true })
  truck: TruckEntity;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  created: Date;

  @Column({default: 0})
  cost: number;

  @Column({default: null})
  limit_date: Date;

  @Column({default: null})
  delivered_date: Date;
}
