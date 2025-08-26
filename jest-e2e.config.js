/** @type {import('jest').Config} */
const baseConfig = require('./jest.config.base');

const config = {
  ...baseConfig,
  
  // E2E-specific settings
  displayName: 'E2E Tests',
  rootDir: '.',
  
  // Test files - only for specific endpoints
  testMatch: ['**/e2e/api/**/*.e2e-spec.ts'],
  
  // Reuse existing infrastructure
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/test/e2e/setup/minimal-e2e-setup.ts'],
  
  // E2E-specific settings
  testTimeout: 30000, // 30 seconds for API tests
  maxWorkers: 1, // DB and HTTP server stability
  forceExit: true, // Force exit for HTTP server
  
  // Coverage
  coverageDirectory: 'coverage/e2e',
  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    '!src/**/*.spec.ts',
    '!src/**/*.integration.spec.ts',
  ],
};

module.exports = config; 