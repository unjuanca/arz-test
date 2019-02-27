import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AlertController } from './alert.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertEntity } from './alert.entity';
import { AlertService } from './alert.service';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { WharehouseModule } from '../wharehouse/wharehouse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AlertEntity]),
    UserModule,
    WharehouseModule,
  ],
  providers: [AlertService],
  controllers: [AlertController],
  exports: [AlertService],
})
export class AlertModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'alerts/', method: RequestMethod.GET },
        { path: 'alert/', method: RequestMethod.POST },
      );
  }
}
