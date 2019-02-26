import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('alert')
export class AlertEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @ManyToOne(type => WharehouseEntity, wharehouse => wharehouse.packages, {
    nullable: true,
  })
  wharehouse: WharehouseEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

  @Column({ default: null, type: 'date' })
  full_date: Date;
}
