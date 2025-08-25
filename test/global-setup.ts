import { PostgreSqlContainer } from '@testcontainers/postgresql';

export = async function globalSetup() {
  console.log('🐳 Starting PostgreSQL Testcontainer...');
  
  try {
    // Start PostgreSQL container
    const postgres = await new PostgreSqlContainer('postgres:15')
      .withDatabase('test_crm_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .withExposedPorts(5432)
      .start();

    // Store container globally for use in tests
    globalThis.__POSTGRES_CONTAINER__ = postgres;

    // Set environment variables for connection
    process.env.TEST_DATABASE_URL = postgres.getConnectionUri();
    process.env.TEST_DATABASE_HOST = postgres.getHost();
    process.env.TEST_DATABASE_PORT = postgres.getMappedPort(5432).toString();
    process.env.TEST_DATABASE_USERNAME = 'test_user';
    process.env.TEST_DATABASE_PASSWORD = 'test_password';
    process.env.TEST_DATABASE_NAME = 'test_crm_db';

    console.log('✅ PostgreSQL Testcontainer started successfully');
    console.log(`📊 Connection: ${process.env.TEST_DATABASE_URL}`);
  } catch (error) {
    console.error('❌ Failed to start PostgreSQL Testcontainer:', error);
    throw error;
  }
}; 