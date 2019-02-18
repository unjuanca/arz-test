import {
    Get,
    Post,
    Body,
    Param,
    Controller,
    UsePipes
} from '@nestjs/common';

import {
    ApiUseTags,
    ApiBearerAuth,
    ApiResponse,
    ApiOperation,
} from '@nestjs/swagger';

//import { Request } from 'express';
import { WharehouseEntity } from './wharehouse.entity';
import { CreateWharehouseDto } from './dto';
//import { WharehouseRO } from './wharehouse.interface';
//import { User } from '../user/user.decorator';
import { ValidationPipe } from '../shared/pipes/validation.pipe';



import { WharehouseService } from './wharehouse.service';

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

  @Get(':packageId')
  async findOne(@Param('packageId') id: number): Promise<WharehouseEntity> {
      return await this.wharehouseService.findOne({id});
  }

  @UsePipes(new ValidationPipe())
  @Post()
  async create(@Body() wharehouseData: CreateWharehouseDto): Promise<WharehouseEntity> {
      return this.wharehouseService.create(wharehouseData);
  }

}
