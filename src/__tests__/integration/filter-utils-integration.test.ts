import { FilterUtils } from '../../utils/filter-utils';
import { IssueTrackerConfig } from '../../config';

describe('FilterUtils Integration Tests', () => {
  describe('Test Pattern Filtering', () => {
    it('should include all tests by default', () => {
      const filterUtils = new FilterUtils();
      
      expect(filterUtils.shouldIncludeTest('src/__tests__/example.test.ts')).toBe(true);
      expect(filterUtils.shouldIncludeTest('src/__tests__/nested/example.test.ts')).toBe(true);
    });
    
    it('should include tests that match include patterns', () => {
      const config: Partial<IssueTrackerConfig> = {
        testFilters: {
          include: ['**/*.test.ts']
        }
      };
      
      const filterUtils = new FilterUtils(config);
      
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
      
      const filterUtils = new FilterUtils(config);
      
      expect(filterUtils.shouldIncludeTest('src/__tests__/example.test.ts')).toBe(true);
      expect(filterUtils.shouldIncludeTest('src/__tests__/example.mock.test.ts')).toBe(false);
      expect(filterUtils.shouldIncludeTest('src/__tests__/excluded/example.test.ts')).toBe(false);
    });
  });
  
  describe('Template Exceptions', () => {
    it('should not skip issue creation by default', () => {
      const filterUtils = new FilterUtils();
      
      expect(filterUtils.shouldSkipIssueCreation('src/__tests__/example.test.ts')).toBe(false);
    });
    
    it('should skip issue creation for tests that match skip patterns', () => {
      const config: Partial<IssueTrackerConfig> = {
        templateExceptions: {
          skipIssueCreation: ['**/*.mock.test.ts', '**/helpers/**/*.test.ts']
        }
      };
      
      const filterUtils = new FilterUtils(config);
      
      expect(filterUtils.shouldSkipIssueCreation('src/__tests__/example.test.ts')).toBe(false);
      expect(filterUtils.shouldSkipIssueCreation('src/__tests__/example.mock.test.ts')).toBe(true);
      expect(filterUtils.shouldSkipIssueCreation('src/__tests__/helpers/example.test.ts')).toBe(true);
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
      
      const filterUtils = new FilterUtils(config);
      
      expect(filterUtils.getCustomTemplate('src/__tests__/example.test.ts')).toBeUndefined();
      expect(filterUtils.getCustomTemplate('src/__tests__/example.integration.test.ts')).toBe('integration-test-template');
      expect(filterUtils.getCustomTemplate('src/__tests__/api/example.test.ts')).toBe('api-test-template');
    });
  });
});
