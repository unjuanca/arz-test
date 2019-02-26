import { Component, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { AlertEntity } from './alert.entity';
import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
import { CreateAlertDto } from './dto';

//import { AlertRO, AlertData } from './alert.interface';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(AlertEntity)
    private readonly alertRepository: Repository<AlertEntity>,
    @InjectRepository(WharehouseEntity)
    private readonly wharehouseRepository: Repository<WharehouseEntity>
  ) {}

  async findAll(): Promise<AlertEntity[]> {
    return await this.alertRepository.find();
  }

  async findOne(where): Promise<AlertEntity> {
    return await this.alertRepository.findOne(where, {relations:['wharehouse']});
  }

  async create(alertData: CreateAlertDto): Promise<AlertEntity> {
    let alert = new AlertEntity();
    alert.description = alertData.description;

    if(alertData.wharehouse){
      const wharehouse = await this.wharehouseRepository.findOne(alertData.wharehouse);
      if(!wharehouse){
        const errors = {wharehouse: 'Wharehouse doesn\'t exists'};
        throw new HttpException({message: 'Input data validation failed', errors}, HttpStatus.BAD_REQUEST);
      }
      alert.wharehouse = wharehouse;
    }

    const newWharehouse = await this.alertRepository.save(alert);

    return newWharehouse;

  }

  
}
