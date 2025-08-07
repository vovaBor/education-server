import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
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
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {} 