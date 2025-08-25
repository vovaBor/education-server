/** @type {import('jest').Config} */
const config = {
  // Basic settings
  displayName: 'Integration Tests',
  rootDir: '.',
  testEnvironment: 'node',
  
  // Test files
  testMatch: ['**/integration/**/*.integration.spec.ts'],
  
  // TypeScript support
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: {
        typeRoots: ['./test/types', './node_modules/@types'],
      },
    }],
  },
  
  // Setup and teardown for Testcontainers
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/test/integration/setup/integration-setup.ts'],
  
  // Integration test settings
  testTimeout: 60000, // Testcontainers need time
  maxWorkers: 1, // Single worker for DB stability
  
  // Disable cache for clean tests
  cache: false,
  
  // Verbose output for debugging
  verbose: true,
  
  // Code coverage
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
  ],
  coverageDirectory: 'coverage/integration',
  
  // Modules
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = config; 