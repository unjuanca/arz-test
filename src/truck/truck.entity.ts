import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('truck')
export class TruckEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @ManyToOne(type => WharehouseEntity, wharehouse => wharehouse.trucks, { nullable: false })
  wharehouse: WharehouseEntity;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  created: Date;

}
