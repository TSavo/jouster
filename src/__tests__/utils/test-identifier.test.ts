import {
  normalizePath,
  getRelativePath,
  extractTestNameParts,
  generateIdentifierFromPath,
  generateIdentifierFromTestResult,
  generateTestIdentifier,
  parseTestIdentifier,
  getTestDescription
} from '../../utils/test-identifier';
import { TestResult } from '../../types';
import path from 'path';

describe('test-identifier', () => {
  describe('normalizePath', () => {
    it('should convert backslashes to forward slashes', () => {
      const input = 'C:\\path\\to\\file.js';
      const expected = 'C:/path/to/file.js';

      expect(normalizePath(input)).toBe(expected);
    });

    it('should leave forward slashes unchanged', () => {
      const input = '/path/to/file.js';

      expect(normalizePath(input)).toBe(input);
    });
  });

  describe('getRelativePath', () => {
    it('should return a relative path from the given cwd', () => {
      const filePath = '/root/project/src/file.js';
      const cwd = '/root/project';
      const expected = 'src/file.js';

      expect(getRelativePath(filePath, cwd)).toBe(expected);
    });
  });

  describe('generateIdentifierFromPath', () => {
    it('should generate an identifier from a file path and full name', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const filePath = '/root/project/path/to/test.ts';
        const fullName = 'Test Suite > test should pass';
        const expected = 'path/to/test.ts:Test Suite:test should pass';

        const result = generateIdentifierFromPath(filePath, fullName);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should use explicit options when provided', () => {
      const filePath = '/root/project/path/to/test.ts';
      const fullName = 'Test Suite > test should pass';
      const options = { cwd: '/root/project' };
      const expected = 'path/to/test.ts:Test Suite:test should pass';

      const result = generateIdentifierFromPath(filePath, fullName, options);

      expect(result).toBe(expected);
    });

    it('should throw an error if fullName is not provided', () => {
      const filePath = '/root/project/path/to/test.ts';

      expect(() => {
        generateIdentifierFromPath(filePath, '');
      }).toThrow('Full name is required');
    });
  });

  describe('generateIdentifierFromTestResult', () => {
    it('should generate an identifier from a TestResult object', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult = {
          testFilePath: '/root/project/path/to/test.ts',
          testSuiteName: 'Test Suite',
          testName: 'test should pass',
          ancestorTitles: [],
          duration: 0,
          failureMessages: [],
          fullName: 'Test Suite test should pass',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed',
          title: 'test should pass'
        };
        const expected = 'path/to/test.ts:Test Suite:test should pass';

        const result = generateIdentifierFromTestResult(testResult);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should use explicit options when provided', () => {
      const testResult = {
        testFilePath: '/root/project/path/to/test.ts',
        testSuiteName: 'Test Suite',
        testName: 'test should pass',
        ancestorTitles: [],
        duration: 0,
        failureMessages: [],
        fullName: 'Test Suite test should pass',
        location: null as any,
        numPassingAsserts: 0,
        status: 'passed',
        title: 'test should pass'
      };
      const options = { cwd: '/root/project' };
      const expected = 'path/to/test.ts:Test Suite:test should pass';

      const result = generateIdentifierFromTestResult(testResult, options);

      expect(result).toBe(expected);
    });

    it('should throw an error if testFilePath is not provided', () => {
      const testResult = {
        // testFilePath is missing
        testSuiteName: 'Test Suite',
        testName: 'test should pass',
        ancestorTitles: [],
        duration: 0,
        failureMessages: [],
        fullName: 'Test Suite test should pass',
        location: null as any,
        numPassingAsserts: 0,
        status: 'passed',
        title: 'test should pass'
      } as any;

      expect(() => {
        generateIdentifierFromTestResult(testResult);
      }).toThrow('Test result does not have a testFilePath');
    });

    it('should use ancestorTitles if testSuiteName is not available', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult = {
          testFilePath: '/root/project/path/to/test.ts',
          // testSuiteName is missing
          ancestorTitles: ['Suite', 'Nested Suite'],
          testName: 'test should pass',
          duration: 0,
          failureMessages: [],
          fullName: 'Suite Nested Suite test should pass',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed',
          title: 'test should pass'
        };
        const expected = 'path/to/test.ts:Suite > Nested Suite:test should pass';

        const result = generateIdentifierFromTestResult(testResult);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should use Default Suite if neither testSuiteName nor ancestorTitles are available', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult = {
          testFilePath: '/root/project/path/to/test.ts',
          // testSuiteName is missing
          // ancestorTitles is missing
          testName: 'test should pass',
          duration: 0,
          failureMessages: [],
          fullName: 'test should pass',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed',
          title: 'test should pass'
        } as any;
        const expected = 'path/to/test.ts:Default Suite:test should pass';

        const result = generateIdentifierFromTestResult(testResult);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should use title if testName is not available', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult = {
          testFilePath: '/root/project/path/to/test.ts',
          testSuiteName: 'Test Suite',
          // testName is missing
          ancestorTitles: [],
          duration: 0,
          failureMessages: [],
          fullName: 'Test Suite test should pass',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed',
          title: 'test should pass'
        };
        const expected = 'path/to/test.ts:Test Suite:test should pass';

        const result = generateIdentifierFromTestResult(testResult);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should use Unknown Test if neither testName nor title are available', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult = {
          testFilePath: '/root/project/path/to/test.ts',
          testSuiteName: 'Test Suite',
          // testName is missing
          // title is missing
          ancestorTitles: [],
          duration: 0,
          failureMessages: [],
          fullName: 'Test Suite Unknown Test',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed'
        } as any;
        const expected = 'path/to/test.ts:Test Suite:Unknown Test';

        const result = generateIdentifierFromTestResult(testResult);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });
  });

  describe('extractTestNameParts', () => {
    it('should extract suite name and test name from a full name', () => {
      const fullName = 'Suite > Nested Suite > Test Name';
      const expected = {
        suiteName: 'Suite > Nested Suite',
        testName: 'Test Name'
      };

      expect(extractTestNameParts(fullName)).toEqual(expected);
    });

    it('should handle a full name with no separator', () => {
      const fullName = 'Test Name';
      const expected = {
        suiteName: 'Default Suite',
        testName: 'Test Name'
      };

      expect(extractTestNameParts(fullName)).toEqual(expected);
    });

    it('should handle an empty string', () => {
      const fullName = '';
      const expected = {
        suiteName: 'Default Suite',
        testName: 'Unknown Test'
      };

      expect(extractTestNameParts(fullName)).toEqual(expected);
    });
  });

  describe('generateTestIdentifier', () => {
    it('should generate a unique identifier for a test', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testFilePath = '/root/project/path/to/test.ts';
        const fullName = 'Test Suite > test should pass';
        const expected = 'path/to/test.ts:Test Suite:test should pass';

        const result = generateTestIdentifier(testFilePath, fullName);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should use explicit options when provided', () => {
      const testFilePath = '/root/project/path/to/test.ts';
      const fullName = 'Test Suite > test should pass';
      const options = { cwd: '/root/project' };
      const expected = 'path/to/test.ts:Test Suite:test should pass';

      const result = generateTestIdentifier(testFilePath, fullName, options);

      expect(result).toBe(expected);
    });

    it('should generate the same identifier for the same test', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testFilePath = '/root/project/path/to/test.ts';
        const fullName = 'Test Suite > test should pass';

        const result1 = generateTestIdentifier(testFilePath, fullName);
        const result2 = generateTestIdentifier(testFilePath, fullName);

        expect(result1).toBe(result2);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should generate different identifiers for different tests', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testFilePath = '/root/project/path/to/test.ts';
        const fullName1 = 'Test Suite > test should pass';
        const fullName2 = 'Test Suite > test should fail';

        const result1 = generateTestIdentifier(testFilePath, fullName1);
        const result2 = generateTestIdentifier(testFilePath, fullName2);

        expect(result1).not.toBe(result2);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should normalize file paths with backslashes', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testFilePath1 = '/root/project/path/to/test.ts';
        const testFilePath2 = '\\root\\project\\path\\to\\test.ts';
        const fullName = 'Test Suite > test should pass';

        const result1 = generateTestIdentifier(testFilePath1, fullName);
        const result2 = generateTestIdentifier(testFilePath2, fullName);

        expect(result1).toBe(result2);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should throw an error if fullName is not provided', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testFilePath = '/root/project/path/to/test.ts';

        expect(() => {
          generateTestIdentifier(testFilePath, '');
        }).toThrow('Full name is required');
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should handle TestResult objects', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult = {
          testFilePath: '/root/project/path/to/test.ts',
          testSuiteName: 'Test Suite',
          testName: 'test should pass',
          ancestorTitles: [],
          duration: 0,
          failureMessages: [],
          fullName: 'Test Suite test should pass',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed',
          title: 'test should pass'
        };
        const expected = 'path/to/test.ts:Test Suite:test should pass';

        const result = generateTestIdentifier(testResult);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should use ancestorTitles if testSuiteName is not available', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult = {
          testFilePath: '/root/project/path/to/test.ts',
          // testSuiteName is missing
          ancestorTitles: ['Suite', 'Nested Suite'],
          testName: 'test should pass',
          duration: 0,
          failureMessages: [],
          fullName: 'Suite Nested Suite test should pass',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed',
          title: 'test should pass'
        };
        const expected = 'path/to/test.ts:Suite > Nested Suite:test should pass';

        const result = generateTestIdentifier(testResult);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should use Default Suite if neither testSuiteName nor ancestorTitles are available', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult = {
          testFilePath: '/root/project/path/to/test.ts',
          // testSuiteName is missing
          // ancestorTitles is missing
          testName: 'test should pass',
          duration: 0,
          failureMessages: [],
          fullName: 'test should pass',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed',
          title: 'test should pass'
        } as any;
        const expected = 'path/to/test.ts:Default Suite:test should pass';

        const result = generateTestIdentifier(testResult);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should use title if testName is not available', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult = {
          testFilePath: '/root/project/path/to/test.ts',
          testSuiteName: 'Test Suite',
          // testName is missing
          ancestorTitles: [],
          duration: 0,
          failureMessages: [],
          fullName: 'Test Suite test should pass',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed',
          title: 'test should pass'
        };
        const expected = 'path/to/test.ts:Test Suite:test should pass';

        const result = generateTestIdentifier(testResult);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should use Unknown Test if neither testName nor title are available', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult = {
          testFilePath: '/root/project/path/to/test.ts',
          testSuiteName: 'Test Suite',
          // testName is missing
          // title is missing
          ancestorTitles: [],
          duration: 0,
          failureMessages: [],
          fullName: 'Test Suite Unknown Test',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed'
        } as any;
        const expected = 'path/to/test.ts:Test Suite:Unknown Test';

        const result = generateTestIdentifier(testResult);

        expect(result).toBe(expected);
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should use explicit options when provided for TestResult objects', () => {
      const testResult = {
        testFilePath: '/root/project/path/to/test.ts',
        testSuiteName: 'Test Suite',
        testName: 'test should pass',
        ancestorTitles: [],
        duration: 0,
        failureMessages: [],
        fullName: 'Test Suite test should pass',
        location: null as any,
        numPassingAsserts: 0,
        status: 'passed',
        title: 'test should pass'
      };
      const options = { cwd: '/root/project' };
      const expected = 'path/to/test.ts:Test Suite:test should pass';

      const result = generateTestIdentifier(testResult, undefined, options);

      expect(result).toBe(expected);
    });

    it('should throw an error if testFilePath is not provided in TestResult', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult = {
          // testFilePath is missing
          testSuiteName: 'Test Suite',
          testName: 'test should pass',
          ancestorTitles: [],
          duration: 0,
          failureMessages: [],
          fullName: 'Test Suite test should pass',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed',
          title: 'test should pass'
        } as any;

        expect(() => {
          generateTestIdentifier(testResult);
        }).toThrow('Test result does not have a testFilePath');
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });
  });

  describe('parseTestIdentifier', () => {
    it('should parse a test identifier', () => {
      const testIdentifier = 'src/file.js:Suite:Test Name';
      const expected = {
        filePath: 'src/file.js',
        suiteName: 'Suite',
        testName: 'Test Name'
      };

      const result = parseTestIdentifier(testIdentifier);

      expect(result).toEqual(expected);
    });

    it('should throw an error for invalid identifiers', () => {
      const invalidIdentifier = 'invalid-identifier';

      expect(() => {
        parseTestIdentifier(invalidIdentifier);
      }).toThrow('Invalid test identifier');
    });
  });

  describe('getTestDescription', () => {
    it('should get a test description from a full name', () => {
      const identifier = 'src/file.js:Suite:Test Name';
      const expected = '"Test Name" in Suite (src/file.js)';

      const result = getTestDescription(identifier);

      expect(result).toBe(expected);
    });
  });
});
