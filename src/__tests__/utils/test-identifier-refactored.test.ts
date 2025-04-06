import path from 'path';
import {
  normalizePath,
  getRelativePath,
  extractTestNameParts,
  generateIdentifierFromPath,
  generateIdentifierFromTestResult,
  generateTestIdentifier,
  parseTestIdentifier,
  getTestDescription
} from '../../utils/test-identifier-refactored';
import { TestResult } from '../../types';

describe('test-identifier-refactored', () => {
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

    it('should handle mixed slashes', () => {
      const input = 'C:/path\\to/file.js';
      const expected = 'C:/path/to/file.js';

      expect(normalizePath(input)).toBe(expected);
    });
  });

  describe('getRelativePath', () => {
    it('should return a relative path from the given cwd', () => {
      const filePath = '/root/project/src/file.js';
      const cwd = '/root/project';
      const expected = 'src/file.js';

      expect(getRelativePath(filePath, cwd)).toBe(expected);
    });

    it('should use process.cwd() when cwd is not provided', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const filePath = '/root/project/src/file.js';
        const expected = 'src/file.js';

        // Call without providing cwd
        expect(getRelativePath(filePath)).toBe(expected);
        expect(process.cwd).toHaveBeenCalled();
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });

    it('should normalize backslashes in the result', () => {
      // Mock path.relative to return a path with backslashes
      const originalRelative = path.relative;
      path.relative = jest.fn().mockReturnValue('src\\file.js');

      try {
        const filePath = '/root/project/src/file.js';
        const cwd = '/root/project';
        const expected = 'src/file.js';

        expect(getRelativePath(filePath, cwd)).toBe(expected);
      } finally {
        // Restore the original function
        path.relative = originalRelative;
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

  describe('generateIdentifierFromPath', () => {
    it('should generate an identifier from a file path and full name', () => {
      const filePath = '/root/project/src/file.js';
      const fullName = 'Suite > Test Name';
      const options = { cwd: '/root/project' };
      const expected = 'src/file.js:Suite:Test Name';

      expect(generateIdentifierFromPath(filePath, fullName, options)).toBe(expected);
    });

    it('should throw an error if full name is not provided', () => {
      const filePath = '/root/project/src/file.js';

      expect(() => {
        generateIdentifierFromPath(filePath, '');
      }).toThrow('Full name is required');
    });
  });

  describe('generateIdentifierFromTestResult', () => {
    it('should generate an identifier from a TestResult object', () => {
      const testResult: TestResult = {
        testFilePath: '/root/project/src/file.js',
        testSuiteName: 'Suite',
        testName: 'Test Name',
        ancestorTitles: [],
        duration: 0,
        failureMessages: [],
        fullName: 'Suite Test Name',
        location: null as any,
        numPassingAsserts: 0,
        status: 'passed',
        title: 'Test Name'
      };
      const options = { cwd: '/root/project' };
      const expected = 'src/file.js:Suite:Test Name';

      expect(generateIdentifierFromTestResult(testResult, options)).toBe(expected);
    });

    it('should use ancestorTitles if testSuiteName is not available', () => {
      const testResult: TestResult = {
        testFilePath: '/root/project/src/file.js',
        ancestorTitles: ['Suite', 'Nested Suite'],
        title: 'Test Name',
        duration: 0,
        failureMessages: [],
        fullName: 'Suite Nested Suite Test Name',
        location: null as any,
        numPassingAsserts: 0,
        status: 'passed'
      };
      const options = { cwd: '/root/project' };
      const expected = 'src/file.js:Suite > Nested Suite:Test Name';

      expect(generateIdentifierFromTestResult(testResult, options)).toBe(expected);
    });

    it('should handle undefined ancestorTitles', () => {
      const testResult = {
        testFilePath: '/root/project/src/file.js',
        // ancestorTitles is undefined
        title: 'Test Name',
        duration: 0,
        failureMessages: [],
        fullName: 'Test Name',
        location: null as any,
        numPassingAsserts: 0,
        status: 'passed'
      } as any as TestResult;
      const options = { cwd: '/root/project' };
      const expected = 'src/file.js:Default Suite:Test Name';

      expect(generateIdentifierFromTestResult(testResult, options)).toBe(expected);
    });

    it('should handle empty ancestorTitles', () => {
      const testResult: TestResult = {
        testFilePath: '/root/project/src/file.js',
        ancestorTitles: [],
        title: 'Test Name',
        duration: 0,
        failureMessages: [],
        fullName: 'Test Name',
        location: null as any,
        numPassingAsserts: 0,
        status: 'passed'
      };
      const options = { cwd: '/root/project' };
      const expected = 'src/file.js:Default Suite:Test Name';

      expect(generateIdentifierFromTestResult(testResult, options)).toBe(expected);
    });

    it('should use title if testName is not available', () => {
      const testResult: TestResult = {
        testFilePath: '/root/project/src/file.js',
        testSuiteName: 'Suite',
        ancestorTitles: [],
        duration: 0,
        failureMessages: [],
        fullName: 'Suite Unknown Test',
        location: null as any,
        numPassingAsserts: 0,
        status: 'passed',
        title: 'Unknown Test'
      };
      const options = { cwd: '/root/project' };
      const expected = 'src/file.js:Suite:Unknown Test';

      expect(generateIdentifierFromTestResult(testResult, options)).toBe(expected);
    });

    it('should handle undefined title', () => {
      const testResult = {
        testFilePath: '/root/project/src/file.js',
        testSuiteName: 'Suite',
        ancestorTitles: [],
        duration: 0,
        failureMessages: [],
        fullName: 'Suite Unknown Test',
        location: null as any,
        numPassingAsserts: 0,
        status: 'passed'
        // title is undefined
      } as any as TestResult;
      const options = { cwd: '/root/project' };
      const expected = 'src/file.js:Suite:Unknown Test';

      expect(generateIdentifierFromTestResult(testResult, options)).toBe(expected);
    });

    it('should throw an error if testFilePath is not available', () => {
      const testResult: TestResult = {
        testSuiteName: 'Suite',
        testName: 'Test Name',
        ancestorTitles: [],
        duration: 0,
        failureMessages: [],
        fullName: 'Suite Test Name',
        location: null as any,
        numPassingAsserts: 0,
        status: 'passed',
        title: 'Test Name'
      };

      expect(() => {
        generateIdentifierFromTestResult(testResult);
      }).toThrow('Test result does not have a testFilePath');
    });
  });

  describe('generateTestIdentifier', () => {
    it('should handle string input (file path)', () => {
      const filePath = '/root/project/src/file.js';
      const fullName = 'Suite > Test Name';
      const options = { cwd: '/root/project' };
      const expected = 'src/file.js:Suite:Test Name';

      expect(generateTestIdentifier(filePath, fullName, options)).toBe(expected);
    });

    it('should handle TestResult object', () => {
      const testResult: TestResult = {
        testFilePath: '/root/project/src/file.js',
        testSuiteName: 'Suite',
        testName: 'Test Name',
        ancestorTitles: [],
        duration: 0,
        failureMessages: [],
        fullName: 'Suite Test Name',
        location: null as any,
        numPassingAsserts: 0,
        status: 'passed',
        title: 'Test Name'
      };
      const options = { cwd: '/root/project' };
      const expected = 'src/file.js:Suite:Test Name';

      expect(generateTestIdentifier(testResult, undefined, options)).toBe(expected);
    });

    it('should use default options when not provided', () => {
      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/root/project');

      try {
        const testResult: TestResult = {
          testFilePath: '/root/project/src/file.js',
          testSuiteName: 'Suite',
          testName: 'Test Name',
          ancestorTitles: [],
          duration: 0,
          failureMessages: [],
          fullName: 'Suite Test Name',
          location: null as any,
          numPassingAsserts: 0,
          status: 'passed',
          title: 'Test Name'
        };
        const expected = 'src/file.js:Suite:Test Name';

        // Call without providing options
        expect(generateTestIdentifier(testResult)).toBe(expected);
        expect(process.cwd).toHaveBeenCalled();
      } finally {
        // Restore the original function
        process.cwd = originalCwd;
      }
    });
  });

  describe('parseTestIdentifier', () => {
    it('should parse a test identifier into its components', () => {
      const identifier = 'src/file.js:Suite:Test Name';
      const expected = {
        filePath: 'src/file.js',
        suiteName: 'Suite',
        testName: 'Test Name'
      };

      expect(parseTestIdentifier(identifier)).toEqual(expected);
    });

    it('should handle file paths with colons', () => {
      const identifier = 'C:/path/to/file.js:Suite:Test Name';
      const expected = {
        filePath: 'C:/path/to/file.js',
        suiteName: 'Suite',
        testName: 'Test Name'
      };

      expect(parseTestIdentifier(identifier)).toEqual(expected);
    });

    it('should handle file paths with multiple colons', () => {
      const identifier = 'http://example.com/file.js:Suite:Test Name';
      const expected = {
        filePath: 'http://example.com/file.js',
        suiteName: 'Suite',
        testName: 'Test Name'
      };

      expect(parseTestIdentifier(identifier)).toEqual(expected);
    });

    it('should throw an error for invalid identifiers with only one part', () => {
      const identifier = 'invalid-identifier';

      expect(() => {
        parseTestIdentifier(identifier);
      }).toThrow('Invalid test identifier');
    });

    it('should throw an error for invalid identifiers with only two parts', () => {
      const identifier = 'file.js:Suite';

      expect(() => {
        parseTestIdentifier(identifier);
      }).toThrow('Invalid test identifier');
    });
  });

  describe('getTestDescription', () => {
    it('should create a human-readable description from an identifier', () => {
      const identifier = 'src/file.js:Suite:Test Name';
      const expected = '"Test Name" in Suite (src/file.js)';

      expect(getTestDescription(identifier)).toBe(expected);
    });
  });
});
