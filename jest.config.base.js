/** @type {import('jest').Config} */
module.exports = {
  // Common TypeScript support
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: {
        typeRoots: ['./test/types', './node_modules/@types'],
      },
    }],
  },
  
  // Environment
  testEnvironment: 'node',
  
  // Module resolution
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
  },
  
  // Support for TypeScript baseUrl
  modulePaths: ['<rootDir>'],
  
  // Common settings
  verbose: true,
  
  // Coverage exclusions (common for all test types)
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.d.ts',
    '!src/main.ts',
  ],
}; 