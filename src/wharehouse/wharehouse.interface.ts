import { WharehouseEntity } from './wharehouse.entity';

export interface WharehouseData {
  name: string;
  city: string;
  country: string;
  limit: number;
}

export interface WharehouseRO {
  wharehouse: WharehouseData;
}

export interface WharehousesRO {
  wharehouses: WharehouseData[];
}
