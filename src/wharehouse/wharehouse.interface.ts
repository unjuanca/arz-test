import { WharehouseEntity } from './wharehouse.entity';

interface WharehouseData {
  name: string;
  city: string;
  address: string;
  limit: number;
}

export interface WharehouseRO {
  wharehouse: WharehouseData;
}

export interface  WharehousesRO {
  wharehouses: WharehouseData[];
}
