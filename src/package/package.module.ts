import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PackageController } from './package.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageEntity } from './package.entity';
import { PackageService } from './package.service';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { WharehouseModule } from '../wharehouse/wharehouse.module';
import { TruckModule } from '../truck/truck.module';
import { AlertModule } from '../main-office-alert/alert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PackageEntity]),
    UserModule,
    WharehouseModule,
    TruckModule,
    AlertModule,
  ],
  providers: [PackageService],
  controllers: [PackageController],
})
export class PackageModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'packages/', method: RequestMethod.GET },
        { path: 'package/:id', method: RequestMethod.GET },
        { path: 'package/', method: RequestMethod.POST },
      );
  }
}
