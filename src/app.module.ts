import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WharehouseModule } from './wharehouse/wharehouse.module';
import { UserModule } from './user/user.module';
import { PackageModule } from './package/package.module';
import { TruckModule } from './truck/truck.module';
import { AlertModule } from './main-office-alert/alert.module';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    WharehouseModule,
    UserModule,
    PackageModule,
    TruckModule,
    AlertModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
}
