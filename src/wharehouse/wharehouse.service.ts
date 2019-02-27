import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WharehouseEntity } from './wharehouse.entity';

import { CreateWharehouseDto } from './dto';

import { PackagesCountService } from '../packages-count/packages-count.service';
import { PackageHelperService } from '../package/package-helper.service';
import { GoogleMapsService } from '../shared/googlemaps.service';

import { PERCENT_LIMIT, PENALTY_COST } from '../config';

@Injectable()
export class WharehouseService {
  constructor(
    @InjectRepository(WharehouseEntity)
    private readonly wharehouseRepository: Repository<WharehouseEntity>,
    private readonly packageCountService: PackagesCountService,
    private readonly packageHelperService: PackageHelperService,
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  async findAll(): Promise<WharehouseEntity[]> {
    return await this.wharehouseRepository.find();
  }

  async findOne(where): Promise<WharehouseEntity> {
    return await this.wharehouseRepository.findOne(where, {
      relations: ['packages'],
    });
  }

  async create(wharehouseData: CreateWharehouseDto): Promise<WharehouseEntity> {
    let wharehouse = new WharehouseEntity();
    wharehouse.name = wharehouseData.name;
    wharehouse.city = wharehouseData.city;
    wharehouse.country = wharehouseData.country;
    wharehouse.limit = wharehouseData.limit;

    const newWharehouse = await this.wharehouseRepository.save(wharehouse);

    return newWharehouse;
  }

  async getWharehouseAndDate(address: string, deliverDate): Promise<any> {
    var origin = [address];
    var wharehouses = await this.findAll();
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
        deliverDate = this.packageHelperService.addDate(deliverDate);
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

    const distancesRes = await this.googleMapsService.getMatrix(origin, destinations);

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

}
