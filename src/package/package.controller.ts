import {
  Get,
  Post,
  Body,
  Query,
  Param,
  Controller,
  UsePipes,
} from '@nestjs/common';
//import { Request } from 'express';
import { PackageService } from './package.service';
import { PackageEntity } from './package.entity';
import { CreatePackageDto } from './dto';
//import { PackageRO,PackageData } from './package.interface';
import { ValidationPipe } from '../shared/pipes/validation.pipe';

import {
  ApiUseTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiUseTags('packages')
@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @ApiOperation({ title: 'Get all packages' })
  @ApiResponse({ status: 200, description: 'Return all packages.' })
  @Get()
  async findAll(): Promise<PackageEntity[]> {
    return await this.packageService.findAll();
  }

  @Get(':packageId')
  async findOne(@Param('packageId') id): Promise<PackageEntity> {
    return await this.packageService.findOne({ id });
  }

  @UsePipes(new ValidationPipe())
  @Post()
  async create(@Body('package') packageData: CreatePackageDto) {
    return this.packageService.create(packageData);
  }
}
