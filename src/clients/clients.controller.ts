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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClientDto: CreateClientDto) {
    return await this.clientsService.create(createClientDto);
  }

  @Get()
  async findAll(@Query('status') status?: string) {
    if (status) {
      return await this.clientsService.findByStatus(status);
    }
    return await this.clientsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.clientsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return await this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.clientsService.remove(id);
    return { message: `Client with ID ${id} has been successfully deleted` };
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return await this.clientsService.findByEmail(email);
  }
} 