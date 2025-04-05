import { jest } from '@jest/globals';
import { FilterUtils } from '../../utils/filter-utils';
import { IssueTrackerConfig } from '../../config';
import * as path from 'path';
import { execSync } from 'child_process';

// Mock execSync
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

describe('FilterUtils', () => {
  let filterUtils: FilterUtils;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shouldIncludeTest', () => {
    it('should include all tests by default', () => {
      filterUtils = new FilterUtils();

      expect(filterUtils.shouldIncludeTest('src/__tests__/example.test.ts')).toBe(true);
      expect(filterUtils.shouldIncludeTest('src/__tests__/nested/example.test.ts')).toBe(true);
    });

    it('should use default include patterns if testFilters.include is undefined', () => {
      const config: Partial<IssueTrackerConfig> = {
        testFilters: {
          exclude: []
        }
      };
      filterUtils = new FilterUtils(config as IssueTrackerConfig);

      expect(filterUtils.shouldIncludeTest('src/__tests__/example.test.ts')).toBe(true);
      expect(filterUtils.shouldIncludeTest('src/__tests__/nested/example.test.ts')).toBe(true);
    });

    it('should include tests that match include patterns', () => {
      const config: Partial<IssueTrackerConfig> = {
        testFilters: {
          include: ['**/*.test.ts']
        }
      };

      filterUtils = new FilterUtils(config);

      expect(filterUtils.shouldIncludeTest('src/__tests__/example.test.ts')).toBe(true);
      expect(filterUtils.shouldIncludeTest('src/__tests__/example.spec.ts')).toBe(false);
    });

    it('should exclude tests that match exclude patterns', () => {
      const config: Partial<IssueTrackerConfig> = {
        testFilters: {
          include: ['**/*.test.ts'],
          exclude: ['**/*.mock.test.ts', '**/excluded/**/*.test.ts']
        }
      };

      filterUtils = new FilterUtils(config);

      expect(filterUtils.shouldIncludeTest('src/__tests__/example.test.ts')).toBe(true);
      expect(filterUtils.shouldIncludeTest('src/__tests__/example.mock.test.ts')).toBe(false);
      expect(filterUtils.shouldIncludeTest('src/__tests__/excluded/example.test.ts')).toBe(false);
    });

    it('should normalize paths for consistent matching', () => {
      const config: Partial<IssueTrackerConfig> = {
        testFilters: {
          include: ['**/utils/*.test.ts'],
          exclude: []
        }
      };

      filterUtils = new FilterUtils(config);

      // These should be equivalent after normalization
      expect(filterUtils.shouldIncludeTest('src/__tests__/utils/example.test.ts')).toBe(true);
      expect(filterUtils.shouldIncludeTest('src\\__tests__\\utils\\example.test.ts')).toBe(true);
    });
  });

  describe('shouldCreateIssuesOnCurrentBranch', () => {
    it('should create issues on all branches by default', () => {
      (execSync as jest.Mock).mockReturnValue(Buffer.from('main'));

      filterUtils = new FilterUtils();

      expect(filterUtils.shouldCreateIssuesOnCurrentBranch()).toBe(true);
    });

    it('should use default include patterns if branchFilters.include is undefined', () => {
      (execSync as jest.Mock).mockReturnValue(Buffer.from('main'));

      const config: Partial<IssueTrackerConfig> = {
        branchFilters: {
          exclude: []
        }
      };

      filterUtils = new FilterUtils(config as IssueTrackerConfig);

      expect(filterUtils.shouldCreateIssuesOnCurrentBranch()).toBe(true);
    });

    it('should create issues on branches that match include patterns', () => {
      (execSync as jest.Mock).mockReturnValue(Buffer.from('main'));

      const config: Partial<IssueTrackerConfig> = {
        branchFilters: {
          include: ['^main$', '^release/.*$']
        }
      };

      filterUtils = new FilterUtils(config);

      expect(filterUtils.shouldCreateIssuesOnCurrentBranch()).toBe(true);

      (execSync as jest.Mock).mockReturnValue(Buffer.from('feature/new-feature'));
      expect(filterUtils.shouldCreateIssuesOnCurrentBranch()).toBe(false);

      (execSync as jest.Mock).mockReturnValue(Buffer.from('release/1.0.0'));
      expect(filterUtils.shouldCreateIssuesOnCurrentBranch()).toBe(true);
    });

    it('should not create issues on branches that match exclude patterns', () => {
      (execSync as jest.Mock).mockReturnValue(Buffer.from('feature/new-feature'));

      const config: Partial<IssueTrackerConfig> = {
        branchFilters: {
          include: ['.*'],
          exclude: ['^feature/.*$', '^test/.*$']
        }
      };

      filterUtils = new FilterUtils(config);

      expect(filterUtils.shouldCreateIssuesOnCurrentBranch()).toBe(false);

      (execSync as jest.Mock).mockReturnValue(Buffer.from('main'));
      expect(filterUtils.shouldCreateIssuesOnCurrentBranch()).toBe(true);

      (execSync as jest.Mock).mockReturnValue(Buffer.from('test/new-test'));
      expect(filterUtils.shouldCreateIssuesOnCurrentBranch()).toBe(false);
    });

    it('should default to main if git command fails', () => {
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error('Git command failed');
      });

      const config: Partial<IssueTrackerConfig> = {
        branchFilters: {
          include: ['^main$']
        }
      };

      filterUtils = new FilterUtils(config);

      expect(filterUtils.shouldCreateIssuesOnCurrentBranch()).toBe(true);
    });
  });

  describe('shouldSkipIssueCreation', () => {
    it('should not skip issue creation by default', () => {
      filterUtils = new FilterUtils();

      expect(filterUtils.shouldSkipIssueCreation('src/__tests__/example.test.ts')).toBe(false);
    });

    it('should use default skip patterns if templateExceptions.skipIssueCreation is undefined', () => {
      const config: Partial<IssueTrackerConfig> = {
        templateExceptions: {}
      };

      filterUtils = new FilterUtils(config as IssueTrackerConfig);

      expect(filterUtils.shouldSkipIssueCreation('src/__tests__/example.test.ts')).toBe(false);
    });

    it('should skip issue creation for tests that match skip patterns', () => {
      const config: Partial<IssueTrackerConfig> = {
        templateExceptions: {
          skipIssueCreation: ['**/*.mock.test.ts', '**/helpers/**/*.test.ts']
        }
      };

      filterUtils = new FilterUtils(config);

      expect(filterUtils.shouldSkipIssueCreation('src/__tests__/example.test.ts')).toBe(false);
      expect(filterUtils.shouldSkipIssueCreation('src/__tests__/example.mock.test.ts')).toBe(true);
      expect(filterUtils.shouldSkipIssueCreation('src/__tests__/helpers/example.test.ts')).toBe(true);
    });
  });

  describe('getCustomTemplate', () => {
    it('should return undefined if no custom template is defined', () => {
      filterUtils = new FilterUtils();

      expect(filterUtils.getCustomTemplate('src/__tests__/example.test.ts')).toBeUndefined();
    });

    it('should use default custom templates if templateExceptions.customTemplates is undefined', () => {
      const config: Partial<IssueTrackerConfig> = {
        templateExceptions: {}
      };

      filterUtils = new FilterUtils(config as IssueTrackerConfig);

      expect(filterUtils.getCustomTemplate('src/__tests__/example.test.ts')).toBeUndefined();
    });

    it('should return custom template for tests that match pattern', () => {
      const config: Partial<IssueTrackerConfig> = {
        templateExceptions: {
          customTemplates: [
            {
              pattern: '**/*.integration.test.ts',
              template: 'integration-test-template'
            },
            {
              pattern: '**/api/**/*.test.ts',
              template: 'api-test-template'
            }
          ]
        }
      };

      filterUtils = new FilterUtils(config);

      expect(filterUtils.getCustomTemplate('src/__tests__/example.test.ts')).toBeUndefined();
      expect(filterUtils.getCustomTemplate('src/__tests__/example.integration.test.ts')).toBe('integration-test-template');
      expect(filterUtils.getCustomTemplate('src/__tests__/api/example.test.ts')).toBe('api-test-template');
    });
  });
});
