import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/infrastructure/entities/typeorm-lead.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/entities/invoice-item.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      User,
      Lead,
      Invoice,
      InvoiceItem,
      Payment,
    ]),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          password: configService.get('REDIS_PASSWORD'),
          database: configService.get<number>('REDIS_CACHE_DB', 1),
        }),
        ttl: configService.get<number>('ANALYTICS_CACHE_TTL', 300000),
        max: configService.get<number>('ANALYTICS_CACHE_MAX_ITEMS', 1000),
      }),
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
