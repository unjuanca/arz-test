import { Component, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { WharehouseEntity } from './wharehouse.entity';

//import { UserEntity } from '../user/user.entity';
import { CreateWharehouseDto } from './dto';

import {WharehouseRO, WharehousesRO} from './wharehouse.interface';

@Injectable()
export class WharehouseService {
  constructor(
    @InjectRepository(WharehouseEntity)
    private readonly wharehouseRepository: Repository<WharehouseEntity>
  ) {}

  async findAll(): Promise<WharehouseEntity[]> {
    return await this.wharehouseRepository.find();
  }

  async findOne(where): Promise<WharehouseEntity> {
    return await this.wharehouseRepository.findOne(where,{ relations: ["packages"] });
  }

  async create(wharehouseData: CreateWharehouseDto): Promise<WharehouseEntity> {
    let wharehouse = new WharehouseEntity();
    wharehouse.name = wharehouseData.name;
    wharehouse.city = wharehouseData.city;
    wharehouse.address = wharehouseData.address;
    wharehouse.limit = wharehouseData.limit;

    const newWharehouse = await this.wharehouseRepository.save(wharehouse);

    return newWharehouse;

  }
}
