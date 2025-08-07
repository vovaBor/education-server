import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { LeadsModule } from './leads/leads.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';

// Import entities
import { User } from './users/entities/user.entity';
import { Client } from './clients/entities/client.entity';
import { Lead } from './leads/entities/lead.entity';
import { Invoice } from './invoices/entities/invoice.entity';
import { InvoiceItem } from './invoices/entities/invoice-item.entity';
import { Payment } from './payments/entities/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
})
export class AppModule {}
