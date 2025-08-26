import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import supertest from 'supertest';

// Import main app module
import { AppModule } from '../../../src/app.module';

let app: INestApplication;
let dataSource: DataSource;
let httpServer: any;

beforeAll(async () => {
  // Check that Testcontainers are running (reuse existing infrastructure)
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL not set. Make sure global setup ran successfully.');
  }

  console.log('🏗️ Creating minimal E2E application for specific endpoints...');

  // Create full application (reuse existing logic)
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  // Apply same configuration as in main.ts
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Initialize application
  await app.init();

  // Get HTTP server for supertest
  httpServer = app.getHttpServer();

  // Get DataSource for direct DB operations
  dataSource = app.get(DataSource);
  
  console.log('✅ Minimal E2E application ready for testing');
}, 30000);

afterAll(async () => {
  console.log('🧹 Cleaning up minimal E2E application...');
  
  if (app) {
    await app.close();
  }
  
  console.log('✅ E2E application cleaned up');
});

beforeEach(async () => {
  // Clean DB before each test (reuse existing logic)
  if (dataSource) {
    await dataSource.synchronize(true);
  }
});

export const getHttpServer = () => {
  if (!httpServer) {
    throw new Error('HTTP server not initialized');
  }
  return httpServer;
};

export const getDataSource = (): DataSource => {
  if (!dataSource) {
    throw new Error('DataSource not initialized');
  }
  return dataSource;
};

// Supertest request helper
export const request = () => {
  return supertest(getHttpServer());
}; 
