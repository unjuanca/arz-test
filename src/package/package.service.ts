import { Component, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { PackageEntity } from './package.entity';

import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
import { TruckEntity } from '../truck/truck.entity';
import { CreatePackageDto } from './dto';

import { GOOGLE_API_KEY,PERCENT_LIMIT,PENALTY_COST } from '../config';

var distance = require('google-distance-matrix');
distance.key(GOOGLE_API_KEY);

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(PackageEntity)
    private readonly packageRepository: Repository<PackageEntity>,
    @InjectRepository(WharehouseEntity)
    private readonly wharehouseRepository: Repository<WharehouseEntity>,
    @InjectRepository(TruckEntity)
    private readonly truckRepository: Repository<TruckEntity>
  ) {}

  async findAll(): Promise<PackageEntity[]> {
    return await this.packageRepository.find();
  }

  async findOne(where): Promise<PackageEntity> {
    return await this.packageRepository.findOne(where, {relations:['wharehouse']});
  }

  async create(packageData: CreatePackageDto): Promise<PackageEntity> {
    let packge = new PackageEntity();
    packge.description = packageData.description;
    packge.address = packageData.address;

    let wharehouseData = await this.getWharehouseAndDate(packge.address,packageData.deliver_date);

    if(wharehouseData){
      const wharehouse = await this.wharehouseRepository.findOne(wharehouseData.wharehouse);
      if(!wharehouse){
        const errors = {wharehouse: 'An error occurs with wharehouses'};
        throw new HttpException({message: 'Input data validation failed', errors}, HttpStatus.BAD_REQUEST);
      }
      packge.wharehouse = wharehouse;
      packge.truck = await this.truckRepository.findOne({wharehouse: wharehouse});
    }else{
      const errors = {wharehouse: 'An error occurs with wharehouses'};
      throw new HttpException({message: 'Input data validation failed', errors}, HttpStatus.BAD_REQUEST);
    }
    packge.penalty_cost = wharehouseData.penalty_cost;
    packge.deliver_date = wharehouseData.date;
    packge.cost = await this.getCost(wharehouseData.distance);

    return await this.packageRepository.save(packge);

  }

  async getCost(distance: string): Promise<any>{
    var desgloce = distance.split(' ');
    if(desgloce[1] === 'm'){//distance its returned by km or m. If m, then transform it to km
      var cost = parseFloat(desgloce[0].replace(",",""))/1000;
    }else{
        if(desgloce[1] === 'km'){
        var cost = parseFloat(desgloce[0].replace(",",""));
      }else{
        const errors = {wharehouse: 'An error occurs with distance unit'};
        throw new HttpException({message: 'Input data validation failed', errors}, HttpStatus.BAD_REQUEST);
      }
    }
    return cost/5;
  }

  async getWharehouseAndDate(address: string,deliver_date): Promise<any>{
    var origin = [address];
    var wharehouses = await this.getDestinations();
    var destinations = [];
    var destinations_ids = [];

    for(var i = 0; i < wharehouses.length; i++){
      //this is to check id from wharehouse (remind association by position)
      destinations_ids.push({name:`${wharehouses[i].city}, ${wharehouses[i].country}`,id:wharehouses[i].id,limit:wharehouses[i].limit});
      //this is to send to api
      destinations.push(`${wharehouses[i].city}, ${wharehouses[i].country}`);
    }

    const distancesRes = await this.getMatrix(origin,destinations);

    for(var i = 0; i < distancesRes.rows[0].elements.length; i++){
      //the association between destinations cities and distances are by position. Because of them, I assume that this ids are always ok
      if(distancesRes.rows[0].elements[i]['status'] === 'OK'){
          distancesRes.rows[0].elements[i]['distance'].id = destinations_ids[i].id;
          distancesRes.rows[0].elements[i]['distance'].limit = destinations_ids[i].limit;
      }else{
        //If a destionations wasn't ok, the we wants removes them from arrays
         distancesRes.rows[0].elements.splice(i,1);
         destinations_ids.splice(i,1);
      }
    }

    var wharehousesSorted = distancesRes.rows[0].elements.sort(function(prev, curr){
      return prev['distance'].value - curr['distance'].value;
    });
    var ok = false;
    var penalty_cost = 0;
    while(!ok){
      for(var i = 0; i < wharehousesSorted.length; i++){
        var res = await this.packageRepository
          .createQueryBuilder('package')
          .select('*')
          .where('wharehouseId = :wharehouse', { wharehouse:wharehousesSorted[i]['distance'].id })
          .andWhere('deliver_date = :deliver_date', { deliver_date:deliver_date })
          .getCount();
        if(res*100/wharehousesSorted[i]['distance'].limit < PERCENT_LIMIT){
          var wharehouse = wharehousesSorted[i]['distance'].id;
          var distance = wharehousesSorted[i]['distance'].text;
          var date = deliver_date;
          ok = true;
          break;
        }
      }
      //if all wharehouses are full, then add a day and penalty cost
      if(!ok){
        deliver_date = this.addDate(deliver_date);
        penalty_cost += PENALTY_COST;
      }
    }

    return {wharehouse,distance,date,penalty_cost};
  }

  public addDate(str) {
    var p = str.split('-');
    var date = new Date(p[0],p[1],p[2]);
    date.setDate(date.getDate() + 1);

    var month = '' + (date.getMonth()),
        day = '' + date.getDate(),
        year = date.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

  async getDestinations(){
    return await this.wharehouseRepository.find();
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
