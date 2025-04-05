import { TestResult } from '../types';

/**
 * Interface for issue manager
 */
export interface IIssueManager {
  /**
   * Process test results
   *
   * @param results Test results
   * @param options Reporter options
   */
  processTestResults(results: any, options?: any): Promise<void>;

  /**
   * Process a test file
   *
   * @param testFilePath Test file path
   * @param testFileResult Test file result
   * @param options Reporter options
   */
  processTestFile(testFilePath: string, testFileResult: any, options?: any): Promise<void>;

  /**
   * Handle a failed test
   *
   * @param testIdentifier Test identifier
   * @param testFilePath Test file path
   * @param test Test result
   * @param options Reporter options
   */
  handleFailedTest(testIdentifier: string, testFilePath: string, test: TestResult, options?: any): Promise<void>;

  /**
   * Handle a passed test
   *
   * @param testIdentifier Test identifier
   * @param testFilePath Test file path
   * @param test Test result
   * @param options Reporter options
   */
  handlePassedTest(testIdentifier: string, testFilePath: string, test: TestResult, options?: any): Promise<void>;
}
