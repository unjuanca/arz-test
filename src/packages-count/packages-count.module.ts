import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { PackagesCountController } from './packages-count.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesCountEntity } from './packages-count.entity';
import { PackagesCountService } from './packages-count.service';
import { WharehouseModule } from '../wharehouse/wharehouse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PackagesCountEntity]),
    forwardRef(() => WharehouseModule),
  ],
  providers: [PackagesCountService],
  controllers: [PackagesCountController],
  exports: [PackagesCountService],
})
export class PackagesCountModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) { }
}
