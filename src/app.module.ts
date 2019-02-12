import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WharehouseModule } from './wharehouse/wharehouse.module';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    WharehouseModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
}
