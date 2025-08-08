import { applyDecorators, Type } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse, 
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse 
} from '@nestjs/swagger';

// Lead ID parameter decorator
export const ApiLeadIdParam = () => applyDecorators(
  ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the lead',
    example: 1,
    schema: { minimum: 1 }
  })
);

// Get all leads endpoint decorator
export const ApiGetAllLeads = <TModel extends Type<any>>(model: TModel) => applyDecorators(
  ApiOperation({ 
    summary: 'Get all leads',
    description: `Returns a list of all leads in the system including:
    - Lead details (title, description, status, priority)
    - Assignment information (assigned user ID)
    - Business metrics (estimated value, expected close date)
    - Client relationship data
    - Timestamps and audit information
    
    Perfect for lead management dashboards and sales pipeline overview.`
  }),
  ApiOkResponse({ 
    description: 'List of leads successfully retrieved',
    type: model
  }),
  ApiBadRequestResponse({ description: 'Invalid request parameters' }),
  ApiInternalServerErrorResponse({ description: 'Internal server error' })
);

// Get single lead endpoint decorator
export const ApiGetSingleLead = <TModel extends Type<any>>(model: TModel) => applyDecorators(
  ApiOperation({ 
    summary: 'Get lead by ID',
    description: `Returns detailed information about a specific lead including:
    - Complete lead profile and business information
    - Current status and priority level
    - Assignment and ownership details
    - Financial metrics and forecasting data
    - Full audit trail with creation and update timestamps
    
    Essential for lead detail views and sales process management.`
  }),
  ApiLeadIdParam(),
  ApiOkResponse({ 
    description: 'Lead details successfully retrieved',
    type: model
  }),
  ApiNotFoundResponse({ description: 'Lead not found' }),
  ApiBadRequestResponse({ description: 'Invalid lead ID provided' }),
  ApiInternalServerErrorResponse({ description: 'Internal server error' })
);

// Create lead endpoint decorator
export const ApiCreateLead = <TModel extends Type<any>>(model: TModel) => applyDecorators(
  ApiOperation({ 
    summary: 'Create a new lead',
    description: `Creates a new lead in the system with the following features:
    - Automatic lead scoring based on priority and estimated value
    - Business rule validation for data integrity
    - Domain event generation for lead creation tracking
    - Integration with CRM workflow automation
    - Audit logging for compliance and tracking
    
    The lead will be created with 'open' status and can be immediately assigned to sales representatives.`
  }),
  ApiCreatedResponse({ 
    description: 'Lead successfully created with automatic scoring',
    type: model
  }),
  ApiBadRequestResponse({ description: 'Invalid lead data provided' }),
  ApiInternalServerErrorResponse({ description: 'Internal server error' })
);

// Assign lead endpoint decorator
export const ApiAssignLead = <TModel extends Type<any>>(model: TModel) => applyDecorators(
  ApiOperation({ 
    summary: 'Assign lead to user',
    description: `Assigns a lead to a specific user with comprehensive business logic:
    - Validates lead assignment eligibility (cannot assign closed leads)
    - Generates domain events for assignment tracking
    - Updates lead ownership and responsibility
    - Triggers workflow notifications and automation
    - Maintains full audit trail of assignment changes
    
    Essential for sales territory management and lead distribution.`
  }),
  ApiLeadIdParam(),
  ApiOkResponse({ 
    description: 'Lead successfully assigned to user',
    type: model
  }),
  ApiNotFoundResponse({ description: 'Lead not found' }),
  ApiBadRequestResponse({ description: 'Cannot assign closed lead or invalid user ID' }),
  ApiInternalServerErrorResponse({ description: 'Internal server error' })
);

// Update lead status endpoint decorator
export const ApiUpdateLeadStatus = <TModel extends Type<any>>(model: TModel) => applyDecorators(
  ApiOperation({ 
    summary: 'Update lead status',
    description: `Updates lead status with sophisticated business rule validation:
    - Enforces valid status transition workflows (open → contacted → qualified → etc.)
    - Prevents invalid status changes that violate business logic
    - Generates comprehensive domain events for status tracking
    - Integrates with sales pipeline analytics and reporting
    - Maintains complete audit trail of status progression
    
    Status transitions follow CRM best practices: open → contacted → qualified → proposal → negotiation → won/lost`
  }),
  ApiLeadIdParam(),
  ApiOkResponse({ 
    description: 'Lead status successfully updated',
    type: model
  }),
  ApiNotFoundResponse({ description: 'Lead not found' }),
  ApiBadRequestResponse({ description: 'Invalid status transition or status value' }),
  ApiInternalServerErrorResponse({ description: 'Internal server error' })
); 
