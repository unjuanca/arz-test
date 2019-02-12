import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { WharehouseController } from './wharehouse.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WharehouseEntity } from './wharehouse.entity';
import { WharehouseService } from './wharehouse.service';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([WharehouseEntity]), UserModule],
  providers: [WharehouseService],
  controllers: [
    WharehouseController
  ]
})
export class WharehouseModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        {path: 'wharehouses/', method: RequestMethod.GET},
        {path: 'wharehouse/:id', method: RequestMethod.GET},
        {path: 'wharehouse/', method: RequestMethod.POST});
  }
}
