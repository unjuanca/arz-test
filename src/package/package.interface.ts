import { PackageEntity } from './package.entity';
import { WharehouseData } from '../wharehouse/wharehouse.interface';
import { TruckData } from '../truck/truck.interface';

export interface PackageData {
  address: string;
  description: string;
  createdAt?: Date;
  wharehouse?: WharehouseData;
  truck?: TruckData;
  cost?: number;
  limit_date?: Date;
  delivered_date?:Date;
}

export interface PackageRO {
  packge: PackageData;
}
