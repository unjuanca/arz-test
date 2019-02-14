import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TruckController } from './truck.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TruckEntity } from './truck.entity';
import { TruckService } from './truck.service';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { WharehouseModule } from '../wharehouse/wharehouse.module';

@Module({
  imports: [TypeOrmModule.forFeature([TruckEntity]), UserModule, WharehouseModule],
  providers: [TruckService],
  controllers: [
    TruckController
  ]
})
export class TruckModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        {path: 'trucks/', method: RequestMethod.GET},
        {path: 'truck/:id', method: RequestMethod.GET},
        {path: 'truck/', method: RequestMethod.POST});
  }
}
