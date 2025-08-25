// Domain entities
import { Lead as DomainLead } from '../../../src/leads/domain/entities/lead.entity';
import { LeadStatus, LeadPriority } from '../../../src/leads/domain/types/lead.types';
import { DatabaseHelpers } from './database.helpers';

// Test data creation options
export interface CreateLeadOptions {
  title?: string;
  description?: string | null;
  status?: LeadStatus;
  priority?: LeadPriority;
  estimatedValue?: number;
  expectedCloseDate?: Date;
  assignedUserId?: number;
  clientId?: number;
}

export interface CreateUserOptions {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface CreateClientOptions {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

// Test data factory functions
export function createTestLead(options: CreateLeadOptions = {}): DomainLead {
  const {
    title = 'Test Lead',
    description = 'Test description',
    status = LeadStatus.OPEN,
    priority = LeadPriority.MEDIUM,
    estimatedValue,
    expectedCloseDate,
    assignedUserId,
    clientId,
  } = options;

  return new DomainLead(
    0, // id will be generated
    title,
    description,
    status,
    priority,
    estimatedValue,
    expectedCloseDate,
    assignedUserId,
    clientId,
    new Date(),
    new Date()
  );
}

export function createTestUser(options: CreateUserOptions = {}) {
  const {
    firstName = 'Test',
    lastName = 'User',
    email = DatabaseHelpers.generateUniqueEmail('test'),
    role = 'sales',
  } = options;

  return { firstName, lastName, email, role };
}

export function createTestClient(options: CreateClientOptions = {}) {
  const {
    name = 'Test Client',
    email = DatabaseHelpers.generateUniqueEmail('client'),
    phone = '+1234567890',
    company = 'Test Company',
  } = options;

  return { name, email, phone, company };
}

// Utility functions for common test scenarios
export const TestScenarios = {
  // Creates lead with minimal data
  minimalLead: () => createTestLead({
    title: 'Minimal Lead',
    description: null,
  }),
}; 