import { PackageEntity } from './package.entity';
import { WharehouseData } from '../wharehouse/wharehouse.interface';

export interface PackageData {
  address: string;
  description: string;
  createdAt?: Date;
  wharehouse?: WharehouseData;
}

export interface PackageRO {
  packge: PackageData;
}
