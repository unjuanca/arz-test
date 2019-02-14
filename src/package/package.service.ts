import { Component, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { PackageEntity } from './package.entity';

import { WharehouseEntity } from '../wharehouse/wharehouse.entity';
import { CreatePackageDto } from './dto';

import { PackageRO, PackageData } from './package.interface';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(PackageEntity)
    private readonly packageRepository: Repository<PackageEntity>,
    @InjectRepository(WharehouseEntity)
    private readonly wharehouseRepository: Repository<WharehouseEntity>
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

    if(packageData.wharehouse){
      const wharehouse = await this.wharehouseRepository.findOne(packageData.wharehouse);
      packge.wharehouse = wharehouse;//if not valid wharehouse, it put in on null
    }

    const newWharehouse = await this.packageRepository.save(packge);

    return newWharehouse;

  }
}
