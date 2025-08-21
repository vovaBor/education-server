import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { ResendModule } from 'nestjs-resend';

import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { LeadsModule } from './leads/leads.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';

// Import entities
import { User } from './users/entities/user.entity';
import { Client } from './clients/entities/client.entity';
import { Lead } from './leads/infrastructure/entities/typeorm-lead.entity';
import { Invoice } from './invoices/entities/invoice.entity';
import { InvoiceItem } from './invoices/entities/invoice-item.entity';
import { Payment } from './payments/entities/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    ResendModule.forRootAsync({
      useFactory: async () => ({
        apiKey: process.env.RESEND_API_KEY || 'your-resend-api-key',
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'crm_user',
      password: process.env.DB_PASSWORD || 'crm_password',
      database: process.env.DB_NAME || 'crm_db',
      entities: [User, Client, Lead, Invoice, InvoiceItem, Payment],
      migrations: ['dist/migrations/*{.ts,.js}'],
      synchronize: false,
      migrationsRun: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    AnalyticsModule,
    UsersModule,
    ClientsModule,
    LeadsModule,
    InvoicesModule,
    PaymentsModule,
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
  ],
})
export class AppModule {}
