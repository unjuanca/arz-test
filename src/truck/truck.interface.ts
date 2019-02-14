import { TruckEntity } from './truck.entity';
import { WharehouseData } from '../wharehouse/wharehouse.interface';

export interface TruckData {
  description: string;
  createdAt: Date;
  wharehouse: WharehouseData;
}

export interface TruckRO {
  truck: TruckData;
}
