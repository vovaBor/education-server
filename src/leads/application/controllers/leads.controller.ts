import {Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Put} from '@nestjs/common';
import {ApiExtraModels, ApiTags, ApiOperation, ApiParam, ApiOkResponse} from '@nestjs/swagger';
import {type CreateLeadCommand, CreateLeadUseCase} from '../use-cases/create-lead.use-case';
import {type AssignLeadCommand, AssignLeadUseCase} from '../use-cases/assign-lead.use-case';
import {type UpdateLeadStatusCommand, UpdateLeadStatusUseCase} from '../use-cases/update-lead-status.use-case';
import type {ILeadRepository} from '../../domain/repositories/lead.repository.interface';
import {LEAD_REPOSITORY} from '../../domain/constants/tokens';

// DTOs
import {CreateLeadDto} from '../dto/create-lead.dto';
import {AssignLeadDto} from '../dto/assign-lead.dto';
import {UpdateLeadStatusDto} from '../dto/update-lead-status.dto';
import {
  LeadListResponseDto,
  LeadOperationResponseDto,
  LeadResponseDto,
  LeadSingleResponseDto
} from '../dto/lead-response.dto';
import {EnrichLeadDto, EnrichLeadResponseDto} from '../dto/lead-enrichment.dto';

// Decorators
import {
  ApiAssignLead,
  ApiCreateLead,
  ApiGetAllLeads,
  ApiGetSingleLead,
  ApiUpdateLeadStatus
} from '../decorators/api-leads.decorators';

// Mappers
import {LeadResponseMapper} from '../mappers/lead-response.mapper';

// Job service
import { LeadJobsService } from '../services/lead-jobs.service';

@ApiTags('Leads')
@ApiExtraModels(
  CreateLeadDto,
  AssignLeadDto,
  UpdateLeadStatusDto,
  LeadResponseDto,
  LeadListResponseDto,
  LeadSingleResponseDto,
  LeadOperationResponseDto,
  EnrichLeadDto,
  EnrichLeadResponseDto
)
@Controller('leads')
export class LeadsController {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
    private readonly createLeadUseCase: CreateLeadUseCase,
    private readonly assignLeadUseCase: AssignLeadUseCase,
    private readonly updateLeadStatusUseCase: UpdateLeadStatusUseCase,
    private readonly leadJobsService: LeadJobsService,
  ) {}

  @Get()
  @ApiGetAllLeads(LeadListResponseDto)
  async findAll(): Promise<LeadListResponseDto> {
    const leads = await this.leadRepository.findAll();
    return { data: LeadResponseMapper.toDtoArray(leads) };
  }

  @Get(':id')
  @ApiGetSingleLead(LeadSingleResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<LeadSingleResponseDto | { error: string }> {
    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      return { error: 'Lead not found' };
    }
    return { data: LeadResponseMapper.toDto(lead) };
  }

  @Post()
  @ApiCreateLead(LeadOperationResponseDto)
  async create(@Body() createLeadDto: CreateLeadDto): Promise<LeadOperationResponseDto> {
    const command: CreateLeadCommand = {
      title: createLeadDto.title,
      description: createLeadDto.description || '',
      priority: createLeadDto.priority,
      estimatedValue: createLeadDto.estimatedValue,
      expectedCloseDate: createLeadDto.expectedCloseDate ? new Date(createLeadDto.expectedCloseDate) : undefined,
      clientId: createLeadDto.clientId,
    };
    return await this.createLeadUseCase.execute(command);
  }

  @Put(':id/assign')
  @ApiAssignLead(LeadOperationResponseDto)
  async assign(
    @Param('id', ParseIntPipe) leadId: number,
    @Body() assignLeadDto: AssignLeadDto
  ): Promise<LeadOperationResponseDto> {
    const command: AssignLeadCommand = {
      leadId,
      userId: assignLeadDto.userId,
    };
    return await this.assignLeadUseCase.execute(command);
  }

  @Put(':id/status')
  @ApiUpdateLeadStatus(LeadOperationResponseDto)
  async updateStatus(
    @Param('id', ParseIntPipe) leadId: number,
    @Body() updateStatusDto: UpdateLeadStatusDto
  ): Promise<LeadOperationResponseDto> {
    const command: UpdateLeadStatusCommand = {
      leadId,
      newStatus: updateStatusDto.status,
      changedBy: updateStatusDto.changedBy,
    };
    return await this.updateLeadStatusUseCase.execute(command);
  }

  @Post(':id/enrich')
  @ApiOperation({ summary: 'Enrich lead with external data' })
  @ApiParam({ name: 'id', type: Number, description: 'Lead ID' })
  @ApiOkResponse({ type: EnrichLeadResponseDto, description: 'Enrichment job started' })
  async enrichLead(
    @Param('id', ParseIntPipe) leadId: number,
    @Body() enrichLeadDto: EnrichLeadDto,
  ): Promise<EnrichLeadResponseDto> {
    return await this.leadJobsService.enrichLead(leadId, enrichLeadDto);
  }

} 
