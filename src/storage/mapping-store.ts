import { IMappingStore } from './mapping-store.interface';
import { IStorageClient } from './storage-client.interface';
import { IssueMapping, GitInfo } from '../types';

/**
 * Mapping store implementation
 */
export class MappingStore implements IMappingStore {
  private storageClient: IStorageClient;

  /**
   * Creates a new mapping store
   * 
   * @param storageClient Storage client
   */
  constructor(storageClient: IStorageClient) {
    this.storageClient = storageClient;
  }

  /**
   * Get a mapping for a test identifier
   * 
   * @param testIdentifier The test identifier
   * @returns The mapping, or undefined if not found
   */
  public getMapping(testIdentifier: string): IssueMapping | undefined {
    return this.storageClient.getMapping(testIdentifier);
  }

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
  public setMapping(
    testIdentifier: string, 
    issueNumber: number, 
    status: string, 
    gitInfo: GitInfo, 
    testFilePath: string, 
    testName: string
  ): void {
    this.storageClient.setMapping(testIdentifier, issueNumber, status, gitInfo, testFilePath, testName);
  }

  /**
   * Update a mapping for a test identifier
   * 
   * @param testIdentifier The test identifier
   * @param updates Updates to apply to the mapping
   * @param gitInfo Git information
   * @param testFilePath The test file path
   * @param testName The test name
   */
  public updateMapping(
    testIdentifier: string, 
    updates: Partial<IssueMapping>, 
    gitInfo: GitInfo, 
    testFilePath: string, 
    testName: string
  ): void {
    this.storageClient.updateMapping(testIdentifier, updates, gitInfo, testFilePath, testName);
  }

  /**
   * Get all mappings
   * 
   * @returns All mappings
   */
  public getAllMappings(): Record<string, IssueMapping> {
    return this.storageClient.getAllMappings();
  }
}
