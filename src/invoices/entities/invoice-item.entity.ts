import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
@Index(['invoiceId'])
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  invoiceId: number;

  @Column({ length: 255 })
  description: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ nullable: true, length: 100 })
  sku: string;

  // Relations
  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;
} 