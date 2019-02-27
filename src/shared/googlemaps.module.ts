import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';

import { GoogleMapsService } from './googlemaps.service';

@Module({
  imports: [],
  providers: [GoogleMapsService],
  controllers: [],
  exports: [GoogleMapsService],
})
export class GoogleMapsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) { }
}
