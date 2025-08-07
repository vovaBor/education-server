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
import { User } from '../../users/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity('leads')
@Index(['status'])
@Index(['priority'])
@Index(['assignedUserId'])
@Index(['clientId'])
@Index(['createdAt'])
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum',
    enum: ['open', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'open'
  })
  status: string;

  @Column({ 
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  })
  priority: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedValue: number;

  @Column({ type: 'date', nullable: true })
  expectedCloseDate: Date;

  @Column({ nullable: true })
  assignedUserId: number;

  @Column({ nullable: true })
  clientId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.leads, { nullable: true })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser: User;

  @ManyToOne(() => Client, (client) => client.leads, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;
} 