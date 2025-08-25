import { Invoice } from '../../../entities/invoice.entity';
import { Client } from '../../../../clients/entities/client.entity';

// Test constants
export const INVOICE_TEST_CONSTANTS = {
  STATUSES: {
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
  },
  TEST_IDS: {
    INVOICE_ID: 1,
    CLIENT_ID: 10,
    INVALID_INVOICE_ID: 999,
  },
  ERROR_MESSAGES: {
    INVOICE_NOT_FOUND: 'Invoice not found',
    ALREADY_PAID: 'Invoice already paid',
    IS_CANCELLED: 'Invoice is cancelled',
    STILL_DRAFT: 'Invoice is still in draft status',
    CLIENT_NOT_FOUND: 'Invoice client not found',
    CLIENT_EMAIL_NOT_FOUND: 'Client email not found',
  },
} as const;

// Test data factories
export const createMockClient = (overrides: Partial<Client> = {}): Client => {
  const client = new Client();
  Object.assign(client, {
    id: INVOICE_TEST_CONSTANTS.TEST_IDS.CLIENT_ID,
    name: 'Test Client',
    email: 'client@test.com',
    phone: '+1234567890',
    address: '123 Test St',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
  return client;
};

export const createMockInvoice = (overrides: Partial<Invoice> = {}): Invoice => {
  const invoice = new Invoice();
  Object.assign(invoice, {
    id: INVOICE_TEST_CONSTANTS.TEST_IDS.INVOICE_ID,
    invoiceNumber: 'INV-TEST-001',
    clientId: INVOICE_TEST_CONSTANTS.TEST_IDS.CLIENT_ID,
    issueDate: new Date('2024-01-01'),
    dueDate: new Date('2024-01-31'),
    status: INVOICE_TEST_CONSTANTS.STATUSES.SENT,
    subtotal: 100,
    taxRate: 0.1,
    taxAmount: 10,
    total: 110,
    paidAmount: 0,
    notes: 'Test invoice',
    createdAt: new Date(),
    updatedAt: new Date(),
    client: createMockClient(),
    ...overrides,
  });
  return invoice;
};

// Scenario factories
export const INVOICE_SCENARIOS = {
  VALID_FOR_REMINDER: () => createMockInvoice({
    status: INVOICE_TEST_CONSTANTS.STATUSES.SENT,
    client: createMockClient({ email: 'valid@test.com' }),
  }),
  
  OVERDUE_VALID_FOR_REMINDER: () => createMockInvoice({
    status: INVOICE_TEST_CONSTANTS.STATUSES.OVERDUE,
    client: createMockClient({ email: 'valid@test.com' }),
  }),
  
  PAID_INVOICE: () => createMockInvoice({
    status: INVOICE_TEST_CONSTANTS.STATUSES.PAID,
    client: createMockClient({ email: 'valid@test.com' }),
  }),
  
  CANCELLED_INVOICE: () => createMockInvoice({
    status: INVOICE_TEST_CONSTANTS.STATUSES.CANCELLED,
    client: createMockClient({ email: 'valid@test.com' }),
  }),
  
  DRAFT_INVOICE: () => createMockInvoice({
    status: INVOICE_TEST_CONSTANTS.STATUSES.DRAFT,
    client: createMockClient({ email: 'valid@test.com' }),
  }),
  
  INVOICE_WITHOUT_CLIENT: () => createMockInvoice({
    status: INVOICE_TEST_CONSTANTS.STATUSES.SENT,
    client: undefined,
  }),
  
  INVOICE_WITH_CLIENT_WITHOUT_EMAIL: () => createMockInvoice({
    status: INVOICE_TEST_CONSTANTS.STATUSES.SENT,
    client: createMockClient({ email: undefined }),
  }),
  
  INVOICE_WITH_CLIENT_EMPTY_EMAIL: () => createMockInvoice({
    status: INVOICE_TEST_CONSTANTS.STATUSES.SENT,
    client: createMockClient({ email: '' }),
  }),
} as const; 