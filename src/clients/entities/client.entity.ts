import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Lead } from '../../leads/entities/lead.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

@Entity('clients')
@Index(['email'], { unique: true })
@Index(['name'])
@Index(['status'])
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 50 })
  phone: string;

  @Column({ nullable: true, length: 255 })
  company: string;

  @Column({ 
    type: 'enum',
    enum: ['prospect', 'active', 'inactive', 'archived'],
    default: 'prospect'
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Lead, (lead) => lead.client)
  leads: Lead[];

  @OneToMany(() => Invoice, (invoice) => invoice.client)
  invoices: Invoice[];
} 