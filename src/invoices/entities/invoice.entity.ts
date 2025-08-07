import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('invoices')
@Index(['status'])
@Index(['clientId'])
@Index(['invoiceNumber'], { unique: true })
@Index(['issueDate'])
@Index(['dueDate'])
@Index(['status', 'dueDate']) // Composite index for overdue queries
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  invoiceNumber: string;

  @Column({ nullable: false })
  clientId: number;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ 
    type: 'enum',
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Client, (client) => client.invoices)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];
} 