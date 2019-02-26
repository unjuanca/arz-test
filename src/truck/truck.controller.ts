import {
  Get,
  Post,
  Body,
  Query,
  Param,
  Controller,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { TruckService } from './truck.service';
import { TruckEntity } from './truck.entity';
import { CreateTruckDto } from './dto';
import { TruckRO, TruckData } from './truck.interface';
import { ValidationPipe } from '../shared/pipes/validation.pipe';

import {
  ApiUseTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiUseTags('trucks')
@Controller('trucks')
export class TruckController {
  constructor(private readonly truckService: TruckService) {}

  @ApiOperation({ title: 'Get all trucks' })
  @ApiResponse({ status: 200, description: 'Return all trucks.' })
  @Get()
  async findAll(): Promise<TruckEntity[]> {
    return await this.truckService.findAll();
  }

  @Get(':truckId')
  async findOne(@Param('truckId') id): Promise<TruckEntity> {
    return await this.truckService.findOne({ id });
  }

  @UsePipes(new ValidationPipe())
  @Post()
  async create(@Body('truck') truckData: CreateTruckDto) {
    return this.truckService.create(truckData);
  }
}
