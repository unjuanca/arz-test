import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { WharehouseController } from './wharehouse.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WharehouseEntity } from './wharehouse.entity';
import { WharehouseService } from './wharehouse.service';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { PackagesCountModule } from '../packages-count/packages-count.module';
import { PackageHelperService } from '../package/package-helper.service';
import { GoogleMapsService } from '../shared/googlemaps.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WharehouseEntity]),
    UserModule,
    forwardRef(() => PackagesCountModule)
  ],
  providers: [
    WharehouseService,
    PackageHelperService,
    GoogleMapsService
  ],
  controllers: [WharehouseController],
  exports: [WharehouseService],
})
export class WharehouseModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'wharehouses/', method: RequestMethod.GET },
        { path: 'wharehouse/:id', method: RequestMethod.GET },
        { path: 'wharehouse/', method: RequestMethod.POST },
      );
  }
}
