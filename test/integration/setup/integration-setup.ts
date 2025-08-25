import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Import all required entities
import { Lead } from '../../../src/leads/infrastructure/entities/typeorm-lead.entity';
import { User } from '../../../src/users/entities/user.entity';
import { Client } from '../../../src/clients/entities/client.entity';
import { Invoice } from '../../../src/invoices/entities/invoice.entity';
import { InvoiceItem } from '../../../src/invoices/entities/invoice-item.entity';
import { Payment } from '../../../src/payments/entities/payment.entity';

// Import only necessary components for testing (without Bull/BullBoard)
import { TypeOrmLeadRepository } from '../../../src/leads/infrastructure/repositories/typeorm-lead.repository';
import { LeadScoringService } from '../../../src/leads/domain/services/lead-scoring.service';
import { LeadAssignmentService } from '../../../src/leads/domain/services/lead-assignment.service';
import { LEAD_REPOSITORY } from '../../../src/leads/domain/constants/tokens';

let app: INestApplication;
let dataSource: DataSource;

beforeAll(async () => {
  // Check that Testcontainers started successfully
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL not set. Make sure global setup ran successfully.');
  }

  console.log('🏗️ Creating NestJS test application...');

  // Create minimal test application with only necessary components
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        url: process.env.TEST_DATABASE_URL,
        entities: [Lead, User, Client, Invoice, InvoiceItem, Payment],
        synchronize: true, // ⚠️ Only for tests!
        dropSchema: true,  // Clean DB for each run
        logging: false,    // Disable SQL logs for clean output
      }),
      TypeOrmModule.forFeature([Lead, User, Client, Invoice, InvoiceItem, Payment]),
    ],
    providers: [
      // Repository
      {
        provide: LEAD_REPOSITORY,
        useClass: TypeOrmLeadRepository,
      },
      
      // Domain Services (without Bull dependencies)
      LeadScoringService,
      LeadAssignmentService,
    ],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  dataSource = app.get(DataSource);
  
  console.log('✅ NestJS test application created successfully');
}, 30000); // 30 seconds for application creation

afterAll(async () => {
  console.log('🧹 Cleaning up NestJS test application...');
  
  if (dataSource) {
    await dataSource.destroy();
  }
  
  if (app) {
    await app.close();
  }
  
  console.log('✅ NestJS test application cleaned up');
});

beforeEach(async () => {
  // Clean DB before each test for isolation
  if (dataSource) {
    await dataSource.synchronize(true);
  }
});

// Export for use in tests
export const getApp = (): INestApplication => {
  if (!app) {
    throw new Error('Test application not initialized');
  }
  return app;
};

export const getDataSource = (): DataSource => {
  if (!dataSource) {
    throw new Error('DataSource not initialized');
  }
  return dataSource;
}; 