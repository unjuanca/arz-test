import { WharehouseData } from '../wharehouse/wharehouse.interface';

export interface PackagesCountData {
  wharehouse: WharehouseData;
  date: Date;
  count: number;
}

export interface PackagesCountRO {
  packge: PackagesCountData;
}
