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
import { PackageHelperService } from './package-helper.service';

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
    private readonly packageHelperService: PackageHelperService,
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

    this.packageHelperService.validateDate(packageData.deliver_date);

    let packge = new PackageEntity();
    packge.description = packageData.description;
    packge.address = packageData.address;

    let wharehouseData = await this.wharehouseService.getWharehouseAndDate(
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
    packge.cost = await this.packageHelperService.getCost(wharehouseData.distance);

    const newPackage = await this.packageRepository.save(packge);
    if(newPackage){
      this.packageCountService.addCount({date:packge.deliver_date,wharehouse:wharehouse});
    }

    return newPackage;
  }

  async getByDate(wharehouse: number, deliverDate: string) {
    return await this.packageRepository
      .createQueryBuilder('package')
      .select('*')
      .where('wharehouseId = :wharehouse', { wharehouse: wharehouse })
      .andWhere('deliver_date = :deliver_date', { deliver_date: deliverDate })
      .getCount();
  }

}
