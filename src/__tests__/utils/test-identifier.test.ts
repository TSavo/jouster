import { generateTestIdentifier, parseTestIdentifier, getTestDescription } from '../../utils/test-identifier';

describe('test-identifier', () => {
  describe('generateTestIdentifier', () => {
    it('should generate a unique identifier for a test', () => {
      const testFilePath = '/path/to/test.ts';
      const fullName = 'Test Suite › test should pass';
      
      const result = generateTestIdentifier(testFilePath, fullName);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(32); // MD5 hash length
    });

    it('should generate the same identifier for the same test', () => {
      const testFilePath = '/path/to/test.ts';
      const fullName = 'Test Suite › test should pass';
      
      const result1 = generateTestIdentifier(testFilePath, fullName);
      const result2 = generateTestIdentifier(testFilePath, fullName);
      
      expect(result1).toBe(result2);
    });

    it('should generate different identifiers for different tests', () => {
      const testFilePath = '/path/to/test.ts';
      const fullName1 = 'Test Suite › test should pass';
      const fullName2 = 'Test Suite › test should fail';
      
      const result1 = generateTestIdentifier(testFilePath, fullName1);
      const result2 = generateTestIdentifier(testFilePath, fullName2);
      
      expect(result1).not.toBe(result2);
    });

    it('should normalize file paths with backslashes', () => {
      const testFilePath1 = '/path/to/test.ts';
      const testFilePath2 = '\\path\\to\\test.ts';
      const fullName = 'Test Suite › test should pass';
      
      const result1 = generateTestIdentifier(testFilePath1, fullName);
      const result2 = generateTestIdentifier(testFilePath2, fullName);
      
      expect(result1).toBe(result2);
    });
  });

  describe('parseTestIdentifier', () => {
    it('should parse a test identifier', () => {
      const testIdentifier = 'test-identifier';
      
      const result = parseTestIdentifier(testIdentifier);
      
      expect(result).toBeDefined();
      expect(result.filePath).toBe('unknown');
      expect(result.testName).toBe('unknown');
    });
  });

  describe('getTestDescription', () => {
    it('should get a test description from a full name', () => {
      const fullName = 'Test Suite › test should pass';
      
      const result = getTestDescription(fullName);
      
      expect(result).toBe('test should pass');
    });

    it('should handle a full name with no separator', () => {
      const fullName = 'test should pass';
      
      const result = getTestDescription(fullName);
      
      expect(result).toBe('test should pass');
    });
  });
});
