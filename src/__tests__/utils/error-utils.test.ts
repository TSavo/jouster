// @ts-nocheck
import { jest } from '@jest/globals';
import { ErrorUtils } from '../../utils/error-utils';

describe('ErrorUtils', () => {
  describe('detectErrorType', () => {
    it('should return Unknown for empty error message', () => {
      const result = ErrorUtils.detectErrorType('');
      expect(result).toBe('Unknown');
    });

    it('should return Unknown for null error message', () => {
      const result = ErrorUtils.detectErrorType(null);
      expect(result).toBe('Unknown');
    });

    it('should detect assertion errors', () => {
      const errorMessage = 'Error: expect(received).toBe(expected)\n    at Object.<anonymous> (/path/to/test.ts:10:10)';
      const result = ErrorUtils.detectErrorType(errorMessage);
      expect(result).toBe('Assertion Error');
    });

    it('should detect type errors', () => {
      const errorMessage = 'TypeError: Cannot read property \'foo\' of undefined\n    at Object.<anonymous> (/path/to/test.ts:10:10)';
      const result = ErrorUtils.detectErrorType(errorMessage);
      expect(result).toBe('Type Error');
    });

    it('should detect reference errors', () => {
      const errorMessage = 'ReferenceError: foo is not defined\n    at Object.<anonymous> (/path/to/test.ts:10:10)';
      const result = ErrorUtils.detectErrorType(errorMessage);
      expect(result).toBe('Reference Error');
    });

    it('should return the first line of the error message for unknown error types', () => {
      const errorMessage = 'Something went wrong\nSecond line';
      const result = ErrorUtils.detectErrorType(errorMessage);
      expect(result).toBe('Something went wrong');
    });
  });
});
