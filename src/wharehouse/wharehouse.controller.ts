import {Get, Post, Body, Query, Param, Controller, UsePipes} from '@nestjs/common';
import { Request } from 'express';
import { WharehouseService } from './wharehouse.service';
import { WharehouseEntity } from './wharehouse.entity';
import { CreateWharehouseDto } from './dto';
import { WharehouseRO } from './wharehouse.interface';
import { User } from '../user/user.decorator';
import { ValidationPipe } from '../shared/pipes/validation.pipe';

import {
  ApiUseTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiUseTags('wharehouses')
@Controller('wharehouses')
export class WharehouseController {

  constructor(private readonly wharehouseService: WharehouseService) {}

  @ApiOperation({ title: 'Get all wharehouses' })
  @ApiResponse({ status: 200, description: 'Return all wharehouses.'})
  @Get()
  async findAll(): Promise<WharehouseEntity[]> {
    return await this.wharehouseService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug): Promise<WharehouseRO> {
    return await this.wharehouseService.findOne({slug});
  }

  @UsePipes(new ValidationPipe())
  @Post()
  async create(@Body() wharehouseData: CreateWharehouseDto) {
    return this.wharehouseService.create(wharehouseData);
  }

}
