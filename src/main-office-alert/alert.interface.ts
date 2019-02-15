import { AlertEntity } from './alert.entity';
import { WharehouseData } from '../wharehouse/wharehouse.interface';

export interface AlertData {
  description: string;
  wharehouse: WharehouseData;
}

export interface AlertRO {
  alert: AlertData;
}
