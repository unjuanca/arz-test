import { Component, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { TruckEntity } from './truck.entity';

import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
import { CreateTruckDto } from './dto';

import { TruckRO, TruckData } from './truck.interface';

@Injectable()
export class TruckService {
  constructor(
    @InjectRepository(TruckEntity)
    private readonly truckRepository: Repository<TruckEntity>,
    @InjectRepository(WharehouseEntity)
    private readonly wharehouseRepository: Repository<WharehouseEntity>
  ) {}

  async findAll(): Promise<TruckEntity[]> {
    return await this.truckRepository.find();
  }

  async findOne(where): Promise<TruckEntity> {
    return await this.truckRepository.findOne(where, {relations:['wharehouse']});
  }

  async create(truckData: CreateTruckDto): Promise<TruckEntity> {
    let truck = new TruckEntity();
    truck.description = truckData.description;

    if(truckData.wharehouse){
      const wharehouse = await this.wharehouseRepository.findOne(truckData.wharehouse);
      if(!wharehouse){
        const errors = {wharehouse: 'Wharehouse doesn\'t exists'};
        throw new HttpException({message: 'Input data validation failed', errors}, HttpStatus.BAD_REQUEST);
      }
      truck.wharehouse = wharehouse;
    }

    const newWharehouse = await this.truckRepository.save(truck);

    return newWharehouse;

  }
}
