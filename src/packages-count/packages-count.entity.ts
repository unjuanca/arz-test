import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('packages_count')
export class PackagesCountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => WharehouseEntity, wharehouse => wharehouse.packages, {
    nullable: true,
  })
  wharehouse: WharehouseEntity;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  count: number;

}
