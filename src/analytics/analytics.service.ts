import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Client) private readonly clientRepository: Repository<Client>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Lead) private readonly leadRepository: Repository<Lead>,
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Revenue by Client - TypeORM QueryBuilder with raw aggregations
   * TypeScript safety + SQL performance
   */
  async getTotalRevenueByClient(limit = 50, offset = 0) {
    return await this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.invoices', 'invoice')
      .leftJoin('client.leads', 'lead')
      .leftJoin('invoice.payments', 'payment', 'payment.status = :paymentStatus', { paymentStatus: 'completed' })
      .select([
        'client.id as client_id',
        'client.name as client_name',
        'client.email as client_email',
        'client.status as client_status',
        
        // Invoice aggregations using SQL functions
        'COUNT(DISTINCT invoice.id) as total_invoices',
        'COUNT(DISTINCT CASE WHEN invoice.status = :paidStatus THEN invoice.id END) as paid_invoices',
        'COUNT(DISTINCT CASE WHEN invoice.status = :overdueStatus THEN invoice.id END) as overdue_invoices',
        
        // Revenue calculations
        'COALESCE(SUM(CASE WHEN invoice.status = :paidStatus THEN invoice.total ELSE 0 END), 0) as total_paid_revenue',
        'COALESCE(SUM(CASE WHEN invoice.status IN (:...outstandingStatuses) THEN invoice.total ELSE 0 END), 0) as outstanding_revenue',
        'COALESCE(SUM(invoice.total), 0) as total_invoiced',
        'COALESCE(AVG(CASE WHEN invoice.status = :paidStatus THEN invoice.total END), 0) as avg_invoice_value',
        
        // Payment aggregations
        'COALESCE(SUM(payment.amount), 0) as total_payments_received',
        
        // Date calculations
        'MIN(invoice.issueDate) as first_invoice_date',
        'MAX(invoice.issueDate) as last_invoice_date',
        
        // Lead conversion metrics
        'COUNT(DISTINCT lead.id) as total_leads',
        'COUNT(DISTINCT CASE WHEN lead.status = :wonStatus THEN lead.id END) as won_leads',
        `ROUND(
          CASE 
            WHEN COUNT(DISTINCT lead.id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN lead.status = :wonStatus THEN lead.id END) * 100.0 / COUNT(DISTINCT lead.id))
            ELSE 0 
          END, 2
        ) as lead_conversion_rate`
      ])
      .setParameters({
        paidStatus: 'paid',
        overdueStatus: 'overdue',
        outstandingStatuses: ['sent', 'overdue'],
        wonStatus: 'won'
      })
      .groupBy('client.id, client.name, client.email, client.status')
      .having('COALESCE(SUM(invoice.total), 0) > 0')
      .orderBy('total_paid_revenue', 'DESC')
      .addOrderBy('total_invoiced', 'DESC')
      .offset(offset)
      .limit(limit)
      .getRawMany(); // Use getRawMany for performance with aggregations
  }

  /**
   * Leads by User - TypeORM QueryBuilder with conditional aggregations
   */
  async getOpenLeadsByUser(limit = 50, status = 'open') {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.leads', 'lead')
      .select([
        'user.id as user_id',
        'user.firstName as first_name',
        'user.lastName as last_name',
        'user.email as user_email',
        
        // Lead counts with conditions
        'COUNT(DISTINCT lead.id) as total_leads',
        'COUNT(DISTINCT CASE WHEN lead.status = :statusFilter THEN lead.id END) as open_leads',
        'COUNT(DISTINCT CASE WHEN lead.priority = :highPriority THEN lead.id END) as high_priority_leads',
        'COUNT(DISTINCT CASE WHEN lead.priority = :urgentPriority THEN lead.id END) as urgent_leads',
        
        // Value calculations
        'COALESCE(SUM(CASE WHEN lead.estimatedValue IS NOT NULL THEN lead.estimatedValue ELSE 0 END), 0) as total_estimated_value',
        'COALESCE(AVG(CASE WHEN lead.estimatedValue IS NOT NULL THEN lead.estimatedValue END), 0) as avg_lead_value',
        
        // Overdue leads calculation
        'COUNT(DISTINCT CASE WHEN lead.expectedCloseDate < CURRENT_DATE AND lead.status NOT IN (:...closedStatuses) THEN lead.id END) as overdue_leads',
        
        // Date ranges
        'MIN(lead.createdAt) as oldest_lead_date',
        'MAX(lead.createdAt) as newest_lead_date'
      ])
      .setParameters({
        statusFilter: status,
        highPriority: 'high',
        urgentPriority: 'urgent',
        closedStatuses: ['won', 'lost']
      })
      .where('user.isActive = :isActive', { isActive: true })
      .groupBy('user.id, user.firstName, user.lastName, user.email')
      .orderBy('open_leads', 'DESC')
      .addOrderBy('total_estimated_value', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  /**
   * Overdue Invoices - TypeORM QueryBuilder with date calculations
   */
  async getOverdueInvoices(minDays = 1, limit = 100) {
    return await this.invoiceRepository
      .createQueryBuilder('invoice')
      .innerJoin('invoice.client', 'client')
      .leftJoin('invoice.payments', 'payment')
      .select([
        'invoice.id as invoice_id',
        'invoice.invoiceNumber',
        'invoice.issueDate',
        'invoice.dueDate',
        'invoice.total as invoice_total',
        'invoice.paidAmount',
        '(invoice.total - invoice.paidAmount) as outstanding_amount',
        
        // Days overdue calculation using SQL
        'CURRENT_DATE - invoice.dueDate as days_overdue',
        
        // Severity classification using CASE
        `CASE 
          WHEN CURRENT_DATE - invoice.dueDate <= 30 THEN 'Recently Overdue'
          WHEN CURRENT_DATE - invoice.dueDate <= 60 THEN 'Moderately Overdue'
          WHEN CURRENT_DATE - invoice.dueDate <= 90 THEN 'Seriously Overdue'
          ELSE 'Severely Overdue'
        END as overdue_severity`,
        
        // Client information
        'client.id as client_id',
        'client.name as client_name',
        'client.email as client_email',
        'client.phone as client_phone',
        'client.status as client_status',
        
        // Payment aggregations
        'COUNT(payment.id) as payment_attempts',
        'COALESCE(MAX(payment.paymentDate), invoice.issueDate) as last_payment_date',
        'COALESCE(SUM(CASE WHEN payment.status = :completedStatus THEN payment.amount ELSE 0 END), 0) as total_payments'
      ])
      .setParameters({
        minDays,
        completedStatus: 'completed'
      })
      .where('invoice.status IN (:...statuses)', { statuses: ['sent', 'overdue'] })
      .andWhere('invoice.dueDate < CURRENT_DATE')
      .andWhere('(CURRENT_DATE - invoice.dueDate) >= :minDays', { minDays })
      .andWhere('(invoice.total - invoice.paidAmount) > 0')
      .groupBy(`
        invoice.id, invoice.invoiceNumber, invoice.issueDate, invoice.dueDate, 
        invoice.total, invoice.paidAmount, client.id, client.name, 
        client.email, client.phone, client.status
      `)
      .orderBy('days_overdue', 'DESC')
      .addOrderBy('outstanding_amount', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  /**
   * Performance Dashboard - Separate optimized queries instead of complex CTE
   */
  async getPerformanceDashboard() {
    // Monthly revenue - simple and efficient
    const monthlyRevenue = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select([
        'DATE_TRUNC(\'month\', invoice.issueDate) as month',
        'SUM(CASE WHEN invoice.status = :paidStatus THEN invoice.total ELSE 0 END) as revenue',
        'COUNT(*) as invoices_count'
      ])
      .setParameters({ paidStatus: 'paid' })
      .where('invoice.issueDate >= :startDate', { 
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) 
      })
      .groupBy('DATE_TRUNC(\'month\', invoice.issueDate)')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Lead pipeline - grouped by status
    const leadPipeline = await this.leadRepository
      .createQueryBuilder('lead')
      .select([
        'lead.status as status',
        'COUNT(*) as count',
        'SUM(COALESCE(lead.estimatedValue, 0)) as total_value',
        'AVG(COALESCE(lead.estimatedValue, 0)) as avg_value'
      ])
      .where('lead.createdAt >= :startDate', { 
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) 
      })
      .groupBy('lead.status')
      .getRawMany();

    // Top clients - with ranking
    const topClientsRaw = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.invoices', 'invoice')
      .select([
        'client.name as name',
        'SUM(CASE WHEN invoice.status = :paidStatus THEN invoice.total ELSE 0 END) as revenue'
      ])
      .setParameters({ paidStatus: 'paid' })
      .groupBy('client.id, client.name')
      .having('SUM(CASE WHEN invoice.status = :paidStatus THEN invoice.total ELSE 0 END) > 0')
      .orderBy('revenue', 'DESC')
      .limit(10)
      .getRawMany();

    // Add ranking in application layer for simplicity
    const topClients = topClientsRaw.map((client, index) => ({
      name: client.name,
      revenue: Number(client.revenue),
      rank: index + 1
    }));

    // Summary stats - parallel simple queries for performance
    const [
      totalClients,
      activeClients,
      totalLeads,
      openLeads,
      totalInvoices,
      overdueInvoices,
      ytdRevenueRaw
    ] = await Promise.all([
      this.clientRepository.count(),
      this.clientRepository.count({ where: { status: 'active' } }),
      this.leadRepository.count(),
      this.leadRepository.count({ where: { status: 'open' } }),
      this.invoiceRepository.count(),
      this.invoiceRepository.count({ where: { status: 'overdue' } }),
      this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('SUM(invoice.total)', 'total')
        .where('invoice.status = :status', { status: 'paid' })
        .andWhere('EXTRACT(YEAR FROM invoice.issueDate) = :year', { 
          year: new Date().getFullYear() 
        })
        .getRawOne()
    ]);

    return {
      monthly_revenue: monthlyRevenue.map(row => ({
        month: row.month,
        revenue: Number(row.revenue),
        invoices_count: Number(row.invoices_count)
      })),
      lead_pipeline: leadPipeline.map(row => ({
        status: row.status,
        count: Number(row.count),
        total_value: Number(row.total_value),
        avg_value: Number(row.avg_value)
      })),
      top_clients: topClients,
      summary_stats: {
        total_clients: totalClients,
        active_clients: activeClients,
        total_leads: totalLeads,
        open_leads: openLeads,
        total_invoices: totalInvoices,
        overdue_invoices: overdueInvoices,
        total_revenue_ytd: Number(ytdRevenueRaw?.total || 0)
      }
    };
  }

  // Performance monitoring methods - use actual QueryBuilder SQL
  async explainRevenueByClientQuery() {
    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.invoices', 'invoice')
      .leftJoin('client.leads', 'lead')
      .leftJoin('invoice.payments', 'payment', 'payment.status = :paymentStatus', { paymentStatus: 'completed' })
      .select('client.id as client_id')
      .setParameters({ paymentStatus: 'completed' })
      .groupBy('client.id')
      .limit(10);

    const [query, parameters] = queryBuilder.getQueryAndParameters();
    const explainQuery = `EXPLAIN (ANALYZE, BUFFERS) ${query}`;
    
    return await this.clientRepository.query(explainQuery, parameters);
  }

  async explainLeadsByUserQuery() {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.leads', 'lead')
      .select('user.id as user_id')
      .where('user.isActive = :isActive', { isActive: true })
      .groupBy('user.id')
      .limit(10);

    const [query, parameters] = queryBuilder.getQueryAndParameters();
    const explainQuery = `EXPLAIN (ANALYZE, BUFFERS) ${query}`;
    
    return await this.userRepository.query(explainQuery, parameters);
  }

  async explainOverdueInvoicesQuery() {
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .innerJoin('invoice.client', 'client')
      .select('invoice.id as invoice_id')
      .where('invoice.status IN (:...statuses)', { statuses: ['sent', 'overdue'] })
      .andWhere('invoice.dueDate < CURRENT_DATE')
      .limit(10);

    const [query, parameters] = queryBuilder.getQueryAndParameters();
    const explainQuery = `EXPLAIN (ANALYZE, BUFFERS) ${query}`;
    
    return await this.invoiceRepository.query(explainQuery, parameters);
  }
} 