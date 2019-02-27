import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageEntity } from './package.entity';

import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
import { PackagesCountEntity } from '../packages-count/packages-count.entity';
import { TruckEntity } from '../truck/truck.entity';
import { AlertEntity } from '../main-office-alert/alert.entity';
import { CreatePackageDto } from './dto';

import { WharehouseService } from '../wharehouse/wharehouse.service';
import { PackagesCountService } from '../packages-count/packages-count.service';
import { AlertService } from '../main-office-alert/alert.service'

import { PERCENT_LIMIT, PENALTY_COST } from '../config';

import distance from '../shared/googlemaps.api';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(PackageEntity)
    private readonly packageRepository: Repository<PackageEntity>,
    @InjectRepository(WharehouseEntity)
    private readonly wharehouseRepository: Repository<WharehouseEntity>,
    @InjectRepository(TruckEntity)
    private readonly truckRepository: Repository<TruckEntity>,
    private readonly alertService: AlertService,
    private readonly wharehouseService: WharehouseService,
    private readonly packageCountService: PackagesCountService,
  ) {}

  async findAll(): Promise<PackageEntity[]> {
    return await this.packageRepository.find();
  }

  async findOne(where): Promise<PackageEntity> {
    return await this.packageRepository.findOne(where, {
      relations: ['wharehouse'],
    });
  }

  async create(packageData: CreatePackageDto): Promise<PackageEntity> {
    let packge = new PackageEntity();
    packge.description = packageData.description;
    packge.address = packageData.address;

    let wharehouseData = await this.getWharehouseAndDate(
      packge.address,
      packageData.deliver_date,
    );

    if (wharehouseData) {
      const wharehouse = await this.wharehouseRepository.findOne(
        wharehouseData.wharehouse,
      );
      if (!wharehouse) {
        const errors = { wharehouse: 'An error occurs with wharehouses' };
        throw new HttpException(
          { message: 'Input data validation failed', errors },
          HttpStatus.BAD_REQUEST,
        );
      }
      packge.wharehouse = wharehouse;
      packge.truck = await this.truckRepository.findOne({
        wharehouse: wharehouse,
      });
    } else {
      const errors = { wharehouse: 'An error occurs with wharehouses' };
      throw new HttpException(
        { message: 'Input data validation failed', errors },
        HttpStatus.BAD_REQUEST,
      );
    }
    packge.penalty_cost = wharehouseData.penaltyCost;
    packge.deliver_date = wharehouseData.date;
    packge.cost = await this.getCost(wharehouseData.distance);

    return await this.packageRepository.save(packge);
  }

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

  async getWharehouseAndDate(address: string, deliverDate): Promise<any> {
    console.log('>>>whahouse>>>>',this.wharehouseService,'<<<<<<<<<<<');
    console.log('>>>packagecount>>>>',this.packageCountService,'<<<<<<<<<<<');
    var origin = [address];
    var wharehouses = await this.wharehouseService.findAll();
    var destinations = [];
    var destinationsId = [];

    console.log(wharehouses);

    /*
    let res = await this.getPackagesCountByDate(
      deliverDate
    );
    */
    let res = await this.packageCountService.find({date:deliverDate});

    console.log('resresres>>',res);

    for (var i = 0; i < wharehouses.length; i++) {
      //this is to check id from wharehouse (remind association by position)
      destinationsId.push({
        name: `${wharehouses[i].city}, ${wharehouses[i].country}`,
        id: wharehouses[i].id,
        limit: wharehouses[i].limit,

      });
      //this is to send to api
      destinations.push(`${wharehouses[i].city}, ${wharehouses[i].country}`);
    }

    const distancesRes = await this.getMatrix(origin, destinations);

    if (!distancesRes.origin_addresses[0]) {
      const errors = { origin_addresses: 'Origin address is not valid' };
      throw new HttpException(
        { message: 'Input data validation failed', errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    for (var i = 0; i < distancesRes.rows[0].elements.length; i++) {
      //the association between destinations cities and distances are by position. Because of them, I assume that this ids are always ok
      if (distancesRes.rows[0].elements[i]['status'] === 'OK') {
        distancesRes.rows[0].elements[i]['distance'].id = destinationsId[i].id;
        distancesRes.rows[0].elements[i]['distance'].limit =
          destinationsId[i].limit;
      } else {
        //If a destionations wasn't ok, the we wants removes them from arrays
        distancesRes.rows[0].elements.splice(i, 1);
        destinationsId.splice(i, 1);
      }
    }

    var wharehousesSorted = distancesRes.rows[0].elements.sort(function(
      prev,
      curr,
    ) {
      return prev['distance'].value - curr['distance'].value;
    });
    let ok = false;
    let penaltyCost = 0;

    /*
    while (!ok) {

      for (let i = 0; i < wharehousesSorted.length; i++) {
        let res = await this.getByDate(
          wharehousesSorted[i]['distance'].id,
          deliverDate,
        );
        if (
          (res * 100) / wharehousesSorted[i]['distance'].limit <
          PERCENT_LIMIT
        ) {
          var wharehouse = wharehousesSorted[i]['distance'].id;
          var distance = wharehousesSorted[i]['distance'].text;
          var date = deliverDate;
          ok = true;
          break;
        } else {
          let alert = new AlertEntity();
          alert.description =
            'This wharehouse reaches 95% of its limit on ' + deliverDate;
          alert.wharehouse = await this.wharehouseRepository.findOne(
            wharehousesSorted[i]['distance'].id,
          );
          alert.full_date = deliverDate;
          this.alertRepository.save(alert);
        }
      }

      //if all wharehouses are full, then add a day and penalty cost
      if (!ok) {
        deliverDate = this.addDate(deliverDate);
        penaltyCost += PENALTY_COST;
      }
    }*/

    //return { wharehouse, distance, date, penaltyCost };
    return false;
  }

  async getByDate(wharehouse: number, deliverDate: string) {
    return await this.packageRepository
      .createQueryBuilder('package')
      .select('*')
      .where('wharehouseId = :wharehouse', { wharehouse: wharehouse })
      .andWhere('deliver_date = :deliver_date', { deliver_date: deliverDate })
      .getCount();
  }

  async getPackagesCountByDate(deliverDate: string) {
    return await this.packageRepository
      .createQueryBuilder('package')
      .select('wharehouseId,COUNT(*) as cant')
      .where('deliver_date = :deliver_date', { deliver_date: deliverDate })
      .groupBy('wharehouseId')
      .getRawMany();
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

  public getMatrix(origin: object,destinations: object): Promise<any>{
    return new Promise((resolve,reject) =>{
      distance.matrix(origin, destinations,(err, distances) => {
          if (!err)
              resolve(distances)
      })
    })
    .then(distances => {
      return distances;
    })
  }
}
