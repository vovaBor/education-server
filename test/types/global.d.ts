import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

// Extend global object for Testcontainers
declare global {
  var __POSTGRES_CONTAINER__: StartedPostgreSqlContainer | undefined;
} 