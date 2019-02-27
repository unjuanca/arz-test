import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageEntity } from './package.entity';

import { PackagesCountService } from '../packages-count/packages-count.service';
import { AlertService } from '../main-office-alert/alert.service'


@Injectable()
export class PackageHelperService {
  constructor() {}

  async getCost(distance: string): Promise<any> {
    var desgloce = distance.split(' ');
    if (desgloce[1] === 'm') {
      //distance its returned by km or m. If m, then transform it to km
      var cost = parseFloat(desgloce[0].replace(',', '')) / 1000;
    } else {
      if (desgloce[1] === 'km') {
        var cost = parseFloat(desgloce[0].replace(',', ''));
      } else {
        const errors = { wharehouse: 'An error occurs with distance unit' };
        throw new HttpException(
          { message: 'Input data validation failed', errors },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return cost / 5;
  }

  public addDate(str) {
    var p = str.split('-');
    var date = new Date(p[0], p[1], p[2]);
    date.setDate(date.getDate() + 1);

    var month = '' + date.getMonth(),
      day = '' + date.getDate(),
      year = date.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  public validateDate(str){
    const p = str.split('-');
    const date = new Date(p[0], parseInt(p[1])-1, p[2]);
    const today = new Date();
    if(date < today){
      const errors = { deliver_date: 'Deliver date must be greater than current' };
      throw new HttpException(
        { message: 'Input data validation failed', errors },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

}
