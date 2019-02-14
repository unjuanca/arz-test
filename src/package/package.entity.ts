import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
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

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  created: Date;

  //@Column({default: false})
  //delivered: boolean;

}
