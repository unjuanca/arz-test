import { WharehouseData } from '../wharehouse/wharehouse.interface';
import { TruckData } from '../truck/truck.interface';

export interface PackageData {
  address: string;
  description: string;
  createdAt?: Date;
  wharehouse?: WharehouseData;
  truck?: TruckData;
  cost?: number;
  penalty_cost?: number;
  deliver_date?: Date;
}

export interface PackageRO {
  packge: PackageData;
}
