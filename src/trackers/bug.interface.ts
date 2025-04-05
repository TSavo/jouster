import { TestResult } from '../types';

/**
 * Represents a bug in the system
 */
export interface Bug {
  /**
   * Bug ID
   */
  id: string;

  /**
   * Bug status (open, closed)
   */
  status: string;

  /**
   * Test identifier
   */
  testIdentifier: string;

  /**
   * Test file path
   */
  testFilePath?: string;

  /**
   * Test result
   */
  test?: TestResult;
}
