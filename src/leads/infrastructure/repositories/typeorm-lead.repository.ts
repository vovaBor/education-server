import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead as DomainLead } from '../../domain/entities/lead.entity';
import { Lead as TypeOrmLead } from 'src/leads/infrastructure/entities/typeorm-lead.entity';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.interface';
import { LeadStatus, LeadPriority } from '../../domain/types/lead.types';

@Injectable()
export class TypeOrmLeadRepository implements ILeadRepository {
  constructor(
    @InjectRepository(TypeOrmLead)
    private readonly repository: Repository<TypeOrmLead>,
  ) {}

  async findById(id: number): Promise<DomainLead | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<DomainLead[]> {
    const entities = await this.repository.find();
    return entities.map(entity => this.toDomain(entity));
  }

  async save(lead: DomainLead): Promise<DomainLead> {
    const entity = this.toEntity(lead);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }



  // Mapping methods
  private toDomain(entity: TypeOrmLead): DomainLead {
    return new DomainLead(
      entity.id,
      entity.title,
      entity.description || null,
      entity.status as LeadStatus,
      entity.priority as LeadPriority,
      entity.estimatedValue || undefined,
      entity.expectedCloseDate || undefined,
      entity.assignedUserId || undefined,
      entity.clientId || undefined,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toEntity(domain: DomainLead): TypeOrmLead {
    const entity = new TypeOrmLead();
    entity.id = domain.id;
    entity.title = domain.title;
    entity.description = domain.description;
    entity.status = domain.status;
    entity.priority = domain.priority;
    entity.estimatedValue = domain.estimatedValue || null;
    entity.expectedCloseDate = domain.expectedCloseDate || null;
    entity.assignedUserId = domain.assignedUserId || null;
    entity.clientId = domain.clientId || null;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
} 