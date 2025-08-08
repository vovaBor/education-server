import { Lead } from '../entities/lead.entity';

export interface ILeadRepository {
  // Basic CRUD operations
  findById(id: number): Promise<Lead | null>;
  findAll(): Promise<Lead[]>;
  save(lead: Lead): Promise<Lead>;
  delete(id: number): Promise<void>;


  

} 
