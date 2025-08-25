import { Test, TestingModule } from '@nestjs/testing';
import { LeadScoringService } from '../lead-scoring.service';
import { ILeadRepository } from '../../repositories/lead.repository.interface';
import { LEAD_REPOSITORY } from '../../constants/tokens';
import { LeadPriority } from '../../types/lead.types';
import { SCORING_CONSTANTS } from '../../constants/scoring.constants';
import {
  createLeadScoringData,
  createTestLead,
  generateValueScoreTestCases,
  generateRecencyScoreTestCases,
  TEST_CONSTANTS,
} from './test-helpers/lead-scoring.test-helpers';

describe('LeadScoringService', () => {
  let service: LeadScoringService;
  let mockRepository: jest.Mocked<ILeadRepository>;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadScoringService,
        { provide: LEAD_REPOSITORY, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<LeadScoringService>(LeadScoringService);
  });

  describe('calculateScore', () => {
    it('should calculate score with all factors', () => {
      const leadData = createLeadScoringData();

      const result = service.calculateScore(leadData);

      expect(result.value).toBeGreaterThan(0);
      expect(result.calculatedAt).toBeInstanceOf(Date);
      expect(result.factors).toHaveLength(TEST_CONSTANTS.FACTOR_COUNTS.ALL_FACTORS);
    });

    it('should calculate score without estimated value', () => {
      const leadData = createLeadScoringData({
        estimatedValue: undefined,
        priority: LeadPriority.MEDIUM,
        clientId: undefined, // Also remove client to get exactly 2 factors
      });

      const result = service.calculateScore(leadData);

      expect(result.factors).toHaveLength(TEST_CONSTANTS.FACTOR_COUNTS.WITHOUT_VALUE);
      expect(result.factors.some(f => f.name === 'Priority')).toBe(true);
      expect(result.factors.some(f => f.name === 'Recency')).toBe(true);
      expect(result.factors.some(f => f.name === 'Estimated Value')).toBe(false);
      expect(result.factors.some(f => f.name === 'Existing Client')).toBe(false);
    });

    it('should calculate score without client relationship', () => {
      const leadData = createLeadScoringData({
        clientId: undefined,
      });

      const result = service.calculateScore(leadData);

      expect(result.factors).toHaveLength(TEST_CONSTANTS.FACTOR_COUNTS.WITHOUT_CLIENT);
      expect(result.factors.some(f => f.name === 'Existing Client')).toBe(false);
      expect(result.factors.some(f => f.name === 'Estimated Value')).toBe(true);
      expect(result.factors.some(f => f.name === 'Priority')).toBe(true);
      expect(result.factors.some(f => f.name === 'Recency')).toBe(true);
    });

    it('should round score to integer', () => {
      const leadData = createLeadScoringData({
        priority: LeadPriority.HIGH,
      });

      const result = service.calculateScore(leadData);

      expect(Number.isInteger(result.value)).toBe(true);
    });
  });

  describe('calculateValueScore', () => {
    const testCases = generateValueScoreTestCases();

    testCases.forEach(({ value, expected, description }) => {
      it(`should return ${expected} for ${description} (${value})`, () => {
        expect(service['calculateValueScore'](value)).toBe(expected);
      });
    });
  });

  describe('calculatePriorityScore', () => {
    Object.entries(SCORING_CONSTANTS.PRIORITY_SCORES).forEach(([priority, expectedScore]) => {
      it(`should return ${expectedScore} for ${priority} priority`, () => {
        expect(service['calculatePriorityScore'](priority as LeadPriority)).toBe(expectedScore);
      });
    });
  });

  describe('calculateRecencyScore', () => {
    const recencyTestCases = generateRecencyScoreTestCases();

    recencyTestCases.forEach(({ date, expected, description }) => {
      it(`should return ${expected} for leads created ${description}`, () => {
        expect(service['calculateRecencyScore'](date)).toBe(expected);
      });
    });
  });

  describe('updateScore', () => {
    it('should update score for existing lead', async () => {
      const mockLead = createTestLead();
      
      mockRepository.findById.mockResolvedValue(mockLead);
      mockRepository.save.mockResolvedValue(mockLead);

      const result = await service.updateScore(TEST_CONSTANTS.TEST_LEAD_ID);

      expect(mockRepository.findById).toHaveBeenCalledWith(TEST_CONSTANTS.TEST_LEAD_ID);
      expect(mockRepository.save).toHaveBeenCalledWith(mockLead);
      expect(result.value).toBeGreaterThan(0);
    });

    it('should throw error when lead not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.updateScore(TEST_CONSTANTS.INVALID_LEAD_ID))
        .rejects
        .toThrow(`Lead with id ${TEST_CONSTANTS.INVALID_LEAD_ID} not found`);
    });
  });


}); 