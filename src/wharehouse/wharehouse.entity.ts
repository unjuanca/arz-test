import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

}
