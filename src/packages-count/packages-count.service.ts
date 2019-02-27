import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackagesCountEntity } from './packages-count.entity';

@Injectable()
export class PackagesCountService {
  constructor(
    @InjectRepository(PackagesCountEntity)
    private readonly packagesCountRepository: Repository<PackagesCountEntity>
  ) {}

  async findAll(): Promise<PackagesCountEntity[]> {
    return await this.packagesCountRepository.find();
  }

  async findOne(where): Promise<PackagesCountEntity> {
    return await this.packagesCountRepository.findOne(where, {
      relations: ['wharehouse'],
    });
  }

  async find(where): Promise<PackagesCountEntity[]> {
    return await this.packagesCountRepository.find({
      where: where,
      relations: ['wharehouse']
    });
  }

  async addCount(where): Promise<any> {
    let pc = await this.findOne(where);
    if(!pc){
      let pcNew = new PackagesCountEntity();
      pcNew.count = 1;
      pcNew.date = where.date;
      pcNew.wharehouse = where.wharehouse;
      return await this.packagesCountRepository.save(pcNew);
    }else{
      pc.count++;
      await this.packagesCountRepository.save(pc);
    }
  }
}
