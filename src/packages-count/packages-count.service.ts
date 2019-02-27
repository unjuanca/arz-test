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
    return await this.packagesCountRepository.find(where);
  }
}
