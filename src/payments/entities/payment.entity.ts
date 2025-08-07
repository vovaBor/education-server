import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';

@Entity('payments')
@Index(['invoiceId'])
@Index(['paymentDate'])
@Index(['paymentMethod'])
@Index(['status'])
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  invoiceId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ 
    type: 'enum',
    enum: ['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'other'],
    default: 'other'
  })
  paymentMethod: string;

  @Column({ 
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  })
  status: string;

  @Column({ nullable: true, length: 255 })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Invoice, (invoice) => invoice.payments)
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;
} 