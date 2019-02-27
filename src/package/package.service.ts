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

    this.validateDate(packageData.deliver_date);

    let packge = new PackageEntity();
    packge.description = packageData.description;
    packge.address = packageData.address;

    let wharehouseData = await this.getWharehouseAndDate(
      packge.address,
      packageData.deliver_date,
    );

    let wharehouse;

    if (wharehouseData) {
      wharehouse = await this.wharehouseRepository.findOne(
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

    const newPackage = await this.packageRepository.save(packge);
    if(newPackage){
      this.packageCountService.addCount({date:packge.deliver_date,wharehouse:wharehouse});
    }

    return newPackage;
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
    var origin = [address];
    var wharehouses = await this.wharehouseService.findAll();
    var destinations = [];
    var destinationsId = [];

    let packagesCount = await this.packageCountService.find({date:deliverDate});

    let ok = false;
    let penaltyCost = 0;

    while(!(!packagesCount || packagesCount.length < wharehouses.length) && !ok){
      for (let i = 0; i < packagesCount.length; i++) {
        let whFound = wharehouses.find((wh)=> wh.id === packagesCount[i].wharehouse.id );
        if (
          ((packagesCount[i].count * 100) / whFound.limit) <
          PERCENT_LIMIT
        ) {
          ok = true;
          break;
        }
      }
      //if all wharehouses are full, then add a day and penalty cost
      if (!ok) {
        deliverDate = this.addDate(deliverDate);
        penaltyCost += PENALTY_COST;
        packagesCount = await this.packageCountService.find({date:deliverDate});
      }
    }

    for (var i = 0; i < wharehouses.length; i++) {
      //this is to check id from wharehouse (remind association by position)
      destinationsId.push({
        name: `${wharehouses[i].city}, ${wharehouses[i].country}`,
        id: wharehouses[i].id,
        limit: wharehouses[i].limit,
        count: (packagesCount.find((pc)=> pc.wharehouse.id === wharehouses[i].id ))?(packagesCount.find((pc)=> pc.wharehouse.id === wharehouses[i].id ).count):(0)
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
        if (
          ((destinationsId[i].count * 100) / destinationsId[i].limit) >=
          PERCENT_LIMIT
        ) {
          //If limit is exceeded, I remove it
          distancesRes.rows[0].elements.splice(i, 1);
          destinationsId.splice(i, 1);
        }else{
          distancesRes.rows[0].elements[i].id = destinationsId[i].id;
          distancesRes.rows[0].elements[i].limit =
          destinationsId[i].limit;
          distancesRes.rows[0].elements[i].count = destinationsId[i].count;
        }
      } else {
        //If a destionations wasn't ok, the we wants removes them from arrays
        distancesRes.rows[0].elements.splice(i, 1);
        destinationsId.splice(i, 1);
      }
    }

    let nearestWharehouse = distancesRes.rows[0].elements.reduce(function(prev, curr) {
        return prev['distance'].value < curr['distance'].value ? prev : curr;
    });

    const wharehouse = nearestWharehouse.id;
    const distance = nearestWharehouse['distance'].text;
    const date = deliverDate;

    return { wharehouse, distance, date, penaltyCost };
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
