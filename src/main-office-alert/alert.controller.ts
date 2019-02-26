import {Get, Post, Body, Query, Param, Controller, UsePipes} from '@nestjs/common';
//import { Request } from 'express';
import { AlertService } from './alert.service';
import { AlertEntity } from './alert.entity';
import { CreateAlertDto } from './dto';
import { ValidationPipe } from '../shared/pipes/validation.pipe';

import {
  ApiUseTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiUseTags('alerts')
@Controller('alerts')
export class AlertController {

  constructor(private readonly alertService: AlertService) {}

  @ApiOperation({ title: 'Get all alerts' })
  @ApiResponse({ status: 200, description: 'Return all alerts.'})
  @Get()
  async findAll(): Promise<AlertEntity[]> {
    return await this.alertService.findAll();
  }

  @UsePipes(new ValidationPipe())
  @Post()
  async create(@Body('alert') alertData: CreateAlertDto) {
    return this.alertService.create(alertData);
  }

}
