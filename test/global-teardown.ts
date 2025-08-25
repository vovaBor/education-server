export = async function globalTeardown() {
  console.log('🧹 Stopping PostgreSQL Testcontainer...');
  
  try {
    const postgres = globalThis.__POSTGRES_CONTAINER__;

    if (postgres) {
      await postgres.stop();
      console.log('✅ PostgreSQL Testcontainer stopped successfully');
    }

    // Clean up environment variables
    delete process.env.TEST_DATABASE_URL;
    delete process.env.TEST_DATABASE_HOST;
    delete process.env.TEST_DATABASE_PORT;
    delete process.env.TEST_DATABASE_USERNAME;
    delete process.env.TEST_DATABASE_PASSWORD;
    delete process.env.TEST_DATABASE_NAME;
  } catch (error) {
    console.error('❌ Failed to stop PostgreSQL Testcontainer:', error);
    // Don't throw error to avoid masking test errors
  }
}; 