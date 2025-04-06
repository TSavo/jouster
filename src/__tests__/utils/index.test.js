"use strict";

const { 
  generateTestIdentifier, 
  parseTestIdentifier, 
  getTestDescription 
} = require('../../utils/index');

describe('utils/index.js', () => {
  describe('generateTestIdentifier', () => {
    it('should generate a unique identifier for a test', () => {
      const testFilePath = '/path/to/test.js';
      const testName = 'should do something';
      
      const result = generateTestIdentifier(testFilePath, testName);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(32); // MD5 hash length
    });
    
    it('should generate the same identifier for the same input', () => {
      const testFilePath = '/path/to/test.js';
      const testName = 'should do something';
      
      const result1 = generateTestIdentifier(testFilePath, testName);
      const result2 = generateTestIdentifier(testFilePath, testName);
      
      expect(result1).toBe(result2);
    });
    
    it('should generate different identifiers for different inputs', () => {
      const testFilePath = '/path/to/test.js';
      const testName1 = 'should do something';
      const testName2 = 'should do something else';
      
      const result1 = generateTestIdentifier(testFilePath, testName1);
      const result2 = generateTestIdentifier(testFilePath, testName2);
      
      expect(result1).not.toBe(result2);
    });
  });
  
  describe('parseTestIdentifier', () => {
    it('should return a default object for any input', () => {
      const testIdentifier = 'any-identifier';
      
      const result = parseTestIdentifier(testIdentifier);
      
      expect(result).toEqual({
        testFilePath: 'unknown',
        testName: 'unknown'
      });
    });
  });
  
  describe('getTestDescription', () => {
    it('should extract the test name from a full test name', () => {
      const testName = 'Suite › Nested Suite › should do something';
      const expected = 'should do something';
      
      const result = getTestDescription(testName);
      
      expect(result).toBe(expected);
    });
    
    it('should return the input if there are no separators', () => {
      const testName = 'should do something';
      
      const result = getTestDescription(testName);
      
      expect(result).toBe(testName);
    });
    
    it('should handle empty strings', () => {
      const testName = '';
      
      const result = getTestDescription(testName);
      
      expect(result).toBe('');
    });
  });
});
