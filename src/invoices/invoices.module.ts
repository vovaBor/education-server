import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem])],
  exports: [TypeOrmModule],
})
export class InvoicesModule {}
