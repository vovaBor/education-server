import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Lead } from '../../leads/infrastructure/entities/typeorm-lead.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['keycloakId'], { unique: true })
@Index(['firstName', 'lastName'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255, nullable: true })
  keycloakId: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 50 })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, length: 255 })
  username: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  lastSyncAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Lead, (lead) => lead.assignedUser)
  leads: Lead[];
} 
