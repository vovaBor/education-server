import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientsRepository.create(createClientDto);
    return await this.clientsRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    return await this.clientsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientsRepository.findOne({ 
      where: { id } 
    });
    
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    
    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    
    Object.assign(client, updateClientDto);
    
    return await this.clientsRepository.save(client);
  }

  async remove(id: number): Promise<void> {
    const client = await this.findOne(id);
    await this.clientsRepository.remove(client);
  }

  async findByEmail(email: string): Promise<Client | null> {
    return await this.clientsRepository.findOne({ 
      where: { email } 
    });
  }

  async findByStatus(status: string): Promise<Client[]> {
    return await this.clientsRepository.find({ 
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }
} 