import { Component, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { PackageEntity } from './package.entity';

import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
import { TruckEntity } from '../truck/truck.entity';
import { CreatePackageDto } from './dto';

import { GOOGLE_API_KEY } from '../config';

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

    let wharehouseData = await this.getWharehouse(packge.address);

    if(wharehouseData){
      const wharehouse = await this.wharehouseRepository.findOne(wharehouseData.id);
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

    packge.cost = await this.getCost(wharehouseData.text);

    return await this.packageRepository.save(packge);

  }

  async getCost(distance: string): Promise<any>{
    var desgloce = distance.split(' ');
    if(desgloce[1] === 'm'){//distance its returned by km or m
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

  async getWharehouse(address: string): Promise<any>{
    var origin = [address];
    var wharehouses = await this.getDestinations();
    var destinations = [];
    var destinations_ids = [];

    for(var i = 0; i < wharehouses.length; i++){
      //this is to check id from wharehouse (remind association by position)
      destinations_ids.push({name:`${wharehouses[i].city}, ${wharehouses[i].country}`,id:wharehouses[i].id});
      //this is to send to api
      destinations.push(`${wharehouses[i].city}, ${wharehouses[i].country}`);
    }

    const distancesRes = await this.getMatrix(origin,destinations);
    
    for(var i = 0; i < distancesRes.rows[0].elements.length; i++){
      //the association between destinations cities and distances are by position. Because of them, I assume that this ids are always ok
      if(distancesRes.rows[0].elements[i]['status'] === 'OK'){
          distancesRes.rows[0].elements[i]['distance'].id = destinations_ids[i].id;
      }else{
        //If a destionations wasn't ok, the we wants removes them from arrays
         distancesRes.rows[0].elements.splice(i,1);
         destinations_ids.splice(i,1);
      }
    }

    var nearWharehouse = distancesRes.rows[0].elements.reduce(function(prev, curr){
      return prev['distance'].value < curr['distance'].value ? prev : curr;
    });

    return nearWharehouse['distance'];
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
