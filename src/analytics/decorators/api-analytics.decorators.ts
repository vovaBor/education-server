import { applyDecorators, Type } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiQuery, 
  ApiOkResponse, 
  ApiBadRequestResponse, 
  ApiInternalServerErrorResponse 
} from '@nestjs/swagger';

// Common error response decorators
export const ApiCommonErrors = () => applyDecorators(
  ApiBadRequestResponse({ 
    description: 'Invalid query parameters provided',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  }),
  ApiInternalServerErrorResponse({ 
    description: 'Internal server error occurred',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' }
      }
    }
  })
);

// Pagination query parameters decorator
export const ApiPaginationQuery = () => applyDecorators(
  ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Maximum number of items to return',
    example: 50,
    schema: { minimum: 1, maximum: 1000, default: 50 }
  }),
  ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Number of items to skip for pagination',
    example: 0,
    schema: { minimum: 0, default: 0 }
  })
);

// Revenue by Client endpoint decorator
export const ApiRevenueByClient = <TModel extends Type<any>>(model: TModel) => applyDecorators(
  ApiOperation({ 
    summary: 'Get total revenue by client',
    description: `Returns comprehensive revenue statistics grouped by client with complex aggregations including:
    - Total paid revenue and outstanding amounts
    - Invoice counts (total, paid, overdue)
    - Average invoice values and payment history
    - Lead conversion rates and client performance metrics
    
    Uses advanced SQL with multiple JOINs for optimal performance.`
  }),
  ApiPaginationQuery(),
  ApiOkResponse({ 
    description: 'Revenue data by client successfully retrieved',
    type: [model]
  }),
  ApiCommonErrors()
);

// Leads by User endpoint decorator
export const ApiLeadsByUser = <TModel extends Type<any>>(model: TModel) => applyDecorators(
  ApiOperation({ 
    summary: 'Get open leads grouped by user',
    description: `Returns comprehensive lead statistics grouped by assigned users including:
    - Total and open leads count per user
    - High priority and urgent leads tracking
    - Estimated deal values and averages
    - Overdue leads identification
    - User performance metrics
    
    Uses TypeORM QueryBuilder with complex aggregations for optimal performance.`
  }),
  ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Maximum number of users to return',
    example: 50,
    schema: { minimum: 1, maximum: 1000, default: 50 }
  }),
  ApiQuery({
    name: 'status',
    type: String,
    required: false,
    description: 'Filter leads by specific status',
    example: 'open',
    enum: ['open', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
  }),
  ApiOkResponse({ 
    description: 'Lead statistics by user successfully retrieved',
    type: [model]
  }),
  ApiCommonErrors()
);

// Overdue Invoices endpoint decorator
export const ApiOverdueInvoices = () => applyDecorators(
  ApiOperation({ 
    summary: 'Get overdue invoices with days overdue calculation',
    description: `Returns detailed information about overdue invoices including:
    - Days overdue calculation (current_date - due_date)
    - Overdue severity categorization (Recently/Moderately/Seriously/Severely)
    - Outstanding amounts and payment history
    - Client contact information for follow-up
    - Payment attempt tracking
    
    Uses raw SQL with date arithmetic for precise calculations and optimal performance.`
  }),
  ApiQuery({
    name: 'min-days',
    type: Number,
    required: false,
    description: 'Minimum number of days overdue to include in results',
    example: 1,
    schema: { minimum: 1, maximum: 365, default: 1 }
  }),
  ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Maximum number of overdue invoices to return',
    example: 100,
    schema: { minimum: 1, maximum: 1000, default: 100 }
  }),
  ApiOkResponse({ 
    description: 'Overdue invoices with calculated days overdue',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          invoice_id: { type: 'number', example: 123 },
          invoiceNumber: { type: 'string', example: 'INV-2024-001' },
          issueDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
          dueDate: { type: 'string', format: 'date-time', example: '2024-02-15T00:00:00.000Z' },
          invoice_total: { type: 'string', example: '5000.00' },
          paidAmount: { type: 'string', example: '2000.00' },
          outstanding_amount: { type: 'string', example: '3000.00' },
          days_overdue: { type: 'number', example: 45 },
          overdue_severity: { 
            type: 'string', 
            example: 'Moderately Overdue',
            enum: ['Recently Overdue', 'Moderately Overdue', 'Seriously Overdue', 'Severely Overdue']
          },
          client_id: { type: 'number', example: 1 },
          client_name: { type: 'string', example: 'Acme Corporation' },
          client_email: { type: 'string', example: 'contact@acme.com' },
          client_phone: { type: 'string', example: '+1-555-0101' },
          client_status: { type: 'string', example: 'active' },
          payment_attempts: { type: 'string', example: '2' },
          last_payment_date: { type: 'string', format: 'date-time', example: '2024-02-20T00:00:00.000Z' },
          total_payments: { type: 'string', example: '2000.00' }
        }
      }
    }
  }),
  ApiCommonErrors()
);

// Performance Dashboard endpoint decorator
export const ApiPerformanceDashboard = <TModel extends Type<any>>(model: TModel) => applyDecorators(
  ApiOperation({ 
    summary: 'Get comprehensive performance dashboard data',
    description: `Returns a complete business performance dashboard in a single query including:
    - Monthly revenue trends (last 12 months)
    - Lead pipeline analysis by status (last 3 months)
    - Top 10 clients by revenue
    - Summary statistics (clients, leads, invoices, YTD revenue)
    
    Uses advanced SQL with CTEs, Window Functions, and JSON aggregations for maximum performance.
    Perfect for executive dashboards and business intelligence reporting.`
  }),
  ApiOkResponse({ 
    description: 'Comprehensive dashboard performance metrics',
    type: model
  }),
  ApiInternalServerErrorResponse({ description: 'Internal server error occurred' })
);

// EXPLAIN ANALYZE endpoints decorator
export const ApiExplainAnalyze = (queryName: string) => applyDecorators(
  ApiOperation({ 
    summary: `EXPLAIN ANALYZE ${queryName} query`,
    description: `Returns PostgreSQL query execution plan analysis for the ${queryName} query including:
    - Execution time and planning time
    - Buffer usage and memory consumption
    - Index usage and scan methods
    - Query cost estimation
    
    Essential for performance monitoring and query optimization.`
  }),
  ApiOkResponse({ 
    description: 'Query execution plan with performance metrics',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          'QUERY PLAN': {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                'Plan': { type: 'object', description: 'Detailed execution plan tree' },
                'Planning Time': { type: 'number', example: 2.043, description: 'Time spent planning the query (ms)' },
                'Execution Time': { type: 'number', example: 0.43, description: 'Time spent executing the query (ms)' },
                'Triggers': { type: 'array', description: 'Trigger execution details' }
              }
            }
          }
        }
      }
    }
  }),
  ApiInternalServerErrorResponse({ description: 'Internal server error occurred' })
); 