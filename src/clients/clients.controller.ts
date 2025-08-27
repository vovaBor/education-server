import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  Resource,
  Roles,
  Scopes,
  RoleMatchingMode,
} from 'nest-keycloak-connect';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
@Resource('Client')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Scopes('Create')
  @Roles({ roles: ['admin', 'manager', 'sales'] })
  async create(@Body() createClientDto: CreateClientDto) {
    return await this.clientsService.create(createClientDto);
  }

  @Get()
  @Scopes('View')
  @Roles({ roles: ['admin', 'manager', 'sales', 'user'] })
  async findAll(@Query('status') status?: string) {
    if (status) {
      return await this.clientsService.findByStatus(status);
    }
    return await this.clientsService.findAll();
  }

  @Get(':id')
  @Scopes('View')
  @Roles({ roles: ['admin', 'manager', 'sales', 'user'] })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.clientsService.findOne(id);
  }

  @Patch(':id')
  @Scopes('Edit')
  @Roles({ roles: ['admin', 'manager', 'sales'] })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return await this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @Scopes('Delete')
  @Roles({ roles: ['admin', 'manager'], mode: RoleMatchingMode.ANY })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.clientsService.remove(id);
    return { message: `Client with ID ${id} has been successfully deleted` };
  }

  @Get('email/:email')
  @Scopes('View')
  @Roles({ roles: ['admin', 'manager', 'sales', 'user'] })
  async findByEmail(@Param('email') email: string) {
    return await this.clientsService.findByEmail(email);
  }
} 