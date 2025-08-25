import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceRepository } from '../invoice.repository';
import { Invoice } from '../../entities/invoice.entity';
import {
  INVOICE_TEST_CONSTANTS,
  INVOICE_SCENARIOS,
  createMockInvoice,
} from './test-helpers/invoice.test-helpers';

describe('InvoiceRepository', () => {
  let invoiceRepository: InvoiceRepository;
  let mockRepository: jest.Mocked<Repository<Invoice>>;

  beforeEach(async () => {
    // Create mock repository
    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceRepository,
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockRepository,
        },
      ],
    }).compile();

    invoiceRepository = module.get<InvoiceRepository>(InvoiceRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canSendReminder', () => {
    describe('successful cases', () => {
      const successfulScenarios = [
        { scenario: 'VALID_FOR_REMINDER', description: 'sent invoice with client email' },
        { scenario: 'OVERDUE_VALID_FOR_REMINDER', description: 'overdue invoice with client email' },
      ];

      successfulScenarios.forEach(({ scenario, description }) => {
        it(`should allow reminder for ${description}`, async () => {
          const mockInvoice = INVOICE_SCENARIOS[scenario]();
          mockRepository.findOne.mockResolvedValue(mockInvoice);

          const result = await invoiceRepository.canSendReminder(INVOICE_TEST_CONSTANTS.TEST_IDS.INVOICE_ID);

          expect(result.canSend).toBe(true);
          expect(result.reason).toBeUndefined();
          expect(result.invoice).toEqual(mockInvoice);
        });
      });

      it('should call repository with correct parameters', async () => {
        const mockInvoice = INVOICE_SCENARIOS.VALID_FOR_REMINDER();
        mockRepository.findOne.mockResolvedValue(mockInvoice);

        await invoiceRepository.canSendReminder(INVOICE_TEST_CONSTANTS.TEST_IDS.INVOICE_ID);

        expect(mockRepository.findOne).toHaveBeenCalledWith({
          where: { id: INVOICE_TEST_CONSTANTS.TEST_IDS.INVOICE_ID },
          relations: ['client'],
        });
      });
    });

    describe('blocking by invoice status', () => {
      const statusBlockingCases = [
        { scenario: 'PAID_INVOICE', expectedReason: 'ALREADY_PAID', description: 'paid' },
        { scenario: 'CANCELLED_INVOICE', expectedReason: 'IS_CANCELLED', description: 'cancelled' },
        { scenario: 'DRAFT_INVOICE', expectedReason: 'STILL_DRAFT', description: 'draft' },
      ];

      statusBlockingCases.forEach(({ scenario, expectedReason, description }) => {
        it(`should not allow reminder for ${description} invoice`, async () => {
          const mockInvoice = INVOICE_SCENARIOS[scenario]();
          mockRepository.findOne.mockResolvedValue(mockInvoice);

          const result = await invoiceRepository.canSendReminder(INVOICE_TEST_CONSTANTS.TEST_IDS.INVOICE_ID);

          expect(result.canSend).toBe(false);
          expect(result.reason).toBe(INVOICE_TEST_CONSTANTS.ERROR_MESSAGES[expectedReason]);
          expect(result.invoice).toEqual(mockInvoice);
        });
      });
    });

    describe('blocking by missing data', () => {
      it('should not allow reminder for non-existent invoice', async () => {
        mockRepository.findOne.mockResolvedValue(null);

        const result = await invoiceRepository.canSendReminder(INVOICE_TEST_CONSTANTS.TEST_IDS.INVALID_INVOICE_ID);

        expect(result.canSend).toBe(false);
        expect(result.reason).toBe(INVOICE_TEST_CONSTANTS.ERROR_MESSAGES.INVOICE_NOT_FOUND);
        expect(result.invoice).toBeUndefined();
      });

      const dataBlockingCases = [
        { scenario: 'INVOICE_WITHOUT_CLIENT', expectedReason: 'CLIENT_NOT_FOUND', description: 'invoice without client' },
        { scenario: 'INVOICE_WITH_CLIENT_WITHOUT_EMAIL', expectedReason: 'CLIENT_EMAIL_NOT_FOUND', description: 'invoice with client without email' },
        { scenario: 'INVOICE_WITH_CLIENT_EMPTY_EMAIL', expectedReason: 'CLIENT_EMAIL_NOT_FOUND', description: 'invoice with client with empty email' },
      ];

      dataBlockingCases.forEach(({ scenario, expectedReason, description }) => {
        it(`should not allow reminder for ${description}`, async () => {
          const mockInvoice = INVOICE_SCENARIOS[scenario]();
          mockRepository.findOne.mockResolvedValue(mockInvoice);

          const result = await invoiceRepository.canSendReminder(INVOICE_TEST_CONSTANTS.TEST_IDS.INVOICE_ID);

          expect(result.canSend).toBe(false);
          expect(result.reason).toBe(INVOICE_TEST_CONSTANTS.ERROR_MESSAGES[expectedReason]);
          expect(result.invoice).toEqual(mockInvoice);
        });
      });
    });

    describe('validation logic order', () => {
      it('should check invoice existence first', async () => {
        mockRepository.findOne.mockResolvedValue(null);

        const result = await invoiceRepository.canSendReminder(INVOICE_TEST_CONSTANTS.TEST_IDS.INVALID_INVOICE_ID);

        expect(result.canSend).toBe(false);
        expect(result.reason).toBe(INVOICE_TEST_CONSTANTS.ERROR_MESSAGES.INVOICE_NOT_FOUND);
        expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      });

      const priorityTestCases = [
        { status: 'PAID', expectedReason: 'ALREADY_PAID', description: 'paid status before other validations' },
        { status: 'CANCELLED', expectedReason: 'IS_CANCELLED', description: 'cancelled status before client validations' },
        { status: 'DRAFT', expectedReason: 'STILL_DRAFT', description: 'draft status before client validations' },
      ];

      priorityTestCases.forEach(({ status, expectedReason, description }) => {
        it(`should check ${description}`, async () => {
          const mockInvoice = createMockInvoice({
            status: INVOICE_TEST_CONSTANTS.STATUSES[status],
            client: undefined,
          });
          mockRepository.findOne.mockResolvedValue(mockInvoice);

          const result = await invoiceRepository.canSendReminder(INVOICE_TEST_CONSTANTS.TEST_IDS.INVOICE_ID);

          expect(result.canSend).toBe(false);
          expect(result.reason).toBe(INVOICE_TEST_CONSTANTS.ERROR_MESSAGES[expectedReason]);
        });
      });
    });

    describe('return value structure', () => {
      const structureTestCases = [
        {
          scenario: 'successful case',
          mockSetup: () => INVOICE_SCENARIOS.VALID_FOR_REMINDER(),
          expectedProperties: ['canSend', 'invoice'],
          notExpectedProperties: ['reason'],
        },
        {
          scenario: 'blocking case',
          mockSetup: () => INVOICE_SCENARIOS.PAID_INVOICE(),
          expectedProperties: ['canSend', 'reason', 'invoice'],
          notExpectedProperties: [],
        },
        {
          scenario: 'non-existent invoice',
          mockSetup: () => null,
          expectedProperties: ['canSend', 'reason'],
          notExpectedProperties: ['invoice'],
        },
      ];

      structureTestCases.forEach(({ scenario, mockSetup, expectedProperties, notExpectedProperties }) => {
        it(`should return correct structure for ${scenario}`, async () => {
          const mockInvoice = mockSetup();
          mockRepository.findOne.mockResolvedValue(mockInvoice);

          const result = await invoiceRepository.canSendReminder(INVOICE_TEST_CONSTANTS.TEST_IDS.INVOICE_ID);

          expectedProperties.forEach(prop => {
            expect(result).toHaveProperty(prop);
          });
          
          notExpectedProperties.forEach(prop => {
            expect(result).not.toHaveProperty(prop);
          });
        });
      });
    });
  });
}); 
