import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: (configService: ConfigService) => {
        return configService.get('database')!;
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {} 