/** @type {import('jest').Config} */
const baseConfig = require('./jest.config.base');

const config = {
  ...baseConfig,
  
  // Integration-specific settings
  displayName: 'Integration Tests',
  rootDir: '.',
  
  // Test files
  testMatch: ['**/integration/**/*.integration.spec.ts'],
  
  // Setup and teardown for Testcontainers
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/test/integration/setup/integration-setup.ts'],
  
  // Integration test settings
  testTimeout: 60000, // Testcontainers need time
  maxWorkers: 1, // Single worker for DB stability
  
  // Integration-specific settings
  cache: false, // Disable cache for clean tests
  coverageDirectory: 'coverage/integration',
  
  // Override coverage to exclude test files
  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
  ],
};

module.exports = config; 