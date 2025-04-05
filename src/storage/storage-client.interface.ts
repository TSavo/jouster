import { IssueMapping, GitInfo } from '../types';

/**
 * Interface for storage clients
 */
export interface IStorageClient {
  /**
   * Get a mapping for a test identifier
   * 
   * @param testIdentifier The test identifier
   * @returns The mapping, or undefined if not found
   */
  getMapping(testIdentifier: string): IssueMapping | undefined;
  
  /**
   * Set a mapping for a test identifier
   * 
   * @param testIdentifier The test identifier
   * @param issueNumber The GitHub issue number
   * @param status The status of the issue
   * @param gitInfo Git information
   * @param testFilePath The test file path
   * @param testName The test name
   */
  setMapping(
    testIdentifier: string, 
    issueNumber: number, 
    status: string, 
    gitInfo: GitInfo, 
    testFilePath: string, 
    testName: string
  ): void;
  
  /**
   * Update a mapping for a test identifier
   * 
   * @param testIdentifier The test identifier
   * @param updates Updates to apply to the mapping
   * @param gitInfo Git information
   * @param testFilePath The test file path
   * @param testName The test name
   */
  updateMapping(
    testIdentifier: string, 
    updates: Partial<IssueMapping>, 
    gitInfo: GitInfo, 
    testFilePath: string, 
    testName: string
  ): void;
  
  /**
   * Get all mappings
   * 
   * @returns All mappings
   */
  getAllMappings(): Record<string, IssueMapping>;
}
