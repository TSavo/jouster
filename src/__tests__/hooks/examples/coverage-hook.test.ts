import { CoverageHook } from '../../../hooks/examples/coverage-hook';
import { TestResult } from '../../../types';

describe('CoverageHook', () => {
  let coverageHook: CoverageHook;
  
  const mockTest: TestResult = {
    ancestorTitles: ['Test Suite'],
    duration: 100,
    failureMessages: ['Test failed'],
    fullName: 'Test Suite › Test Name',
    location: '',
    numPassingAsserts: 0,
    status: 'failed',
    title: 'Test Name'
  };
  
  beforeEach(() => {
    coverageHook = new CoverageHook();
  });
  
  describe('processIssueData', () => {
    it('should add coverage information to template data', async () => {
      const data = { testName: 'Test Name' };
      const result = await coverageHook.processIssueData(data, mockTest, 'src/example.ts');
      
      expect(result).toEqual({
        testName: 'Test Name',
        coverage: {
          statements: 85,
          branches: 70,
          functions: 90,
          lines: 85
        }
      });
    });
    
    it('should add default coverage information for unknown files', async () => {
      const data = { testName: 'Test Name' };
      const result = await coverageHook.processIssueData(data, mockTest, 'src/unknown.ts');
      
      expect(result).toEqual({
        testName: 'Test Name',
        coverage: {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0
        }
      });
    });
  });
  
  describe('processCloseData', () => {
    it('should add coverage information to template data', async () => {
      const data = { testName: 'Test Name' };
      const result = await coverageHook.processCloseData(data, mockTest, 'src/example.ts');
      
      expect(result).toEqual({
        testName: 'Test Name',
        coverage: {
          statements: 85,
          branches: 70,
          functions: 90,
          lines: 85
        }
      });
    });
  });
  
  describe('processReopenData', () => {
    it('should add coverage information to template data', async () => {
      const data = { testName: 'Test Name' };
      const result = await coverageHook.processReopenData(data, mockTest, 'src/example.ts');
      
      expect(result).toEqual({
        testName: 'Test Name',
        coverage: {
          statements: 85,
          branches: 70,
          functions: 90,
          lines: 85
        }
      });
    });
  });
});
