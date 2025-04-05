import fs from 'fs';
import path from 'path';
import { IStorageClient } from './storage-client.interface';
import { IssueMapping, GitInfo } from '../types';

/**
 * JSON file storage client
 */
export class JsonStorage implements IStorageClient {
  private mappings: Record<string, IssueMapping>;
  private databasePath: string;

  /**
   * Creates a new JSON storage client
   *
   * @param databasePath Path to the JSON file
   */
  constructor(databasePath?: string) {
    this.databasePath = databasePath || path.join(process.cwd(), 'test-issue-mapping.json');
    this.mappings = {};
    this.loadMappings();
  }

  /**
   * Loads mappings from the database file
   */
  private loadMappings(): void {
    try {
      if (fs.existsSync(this.databasePath)) {
        const data = fs.readFileSync(this.databasePath, 'utf8');
        this.mappings = JSON.parse(data);
      } else {
        this.mappings = {};
      }
    } catch (error) {
      this.mappings = {};
    }
  }

  /**
   * Saves mappings to the database file
   */
  private saveMappings(): void {
    try {
      const dir = path.dirname(this.databasePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.databasePath, JSON.stringify(this.mappings, null, 2), 'utf8');
    } catch (error) {
      // Silently handle errors
    }
  }

  /**
   * Gets a mapping for a test identifier
   *
   * @param testIdentifier The test identifier
   * @returns The mapping, or undefined if not found
   */
  public getMapping(testIdentifier: string): IssueMapping | undefined {
    return this.mappings[testIdentifier];
  }

  /**
   * Sets a mapping for a test identifier
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
    gitInfo: GitInfo = {},
    testFilePath: string = '',
    testName: string = ''
  ): void {
    const now = new Date().toISOString();
    const mapping = this.mappings[testIdentifier] || {};

    this.mappings[testIdentifier] = {
      ...mapping,
      issueNumber,
      status,
      lastUpdate: now,
      lastFailure: this.getLastFailure(status, mapping, now),
      fixedBy: this.getFixedBy(status, mapping, gitInfo),
      fixCommit: this.getFixCommit(status, mapping, gitInfo),
      fixMessage: this.getFixMessage(status, mapping, gitInfo),
      testFilePath: this.getTestFilePath(mapping, testFilePath),
      testName: this.getTestName(mapping, testName)
    };

    this.saveMappings();
  }

  /**
   * Get the lastFailure value based on status
   */
  private getLastFailure(status: string, mapping: any, now: string): string {
    return status === 'open' ? now : mapping.lastFailure || now;
  }

  /**
   * Get the fixedBy value based on status
   */
  private getFixedBy(status: string, mapping: any, gitInfo: GitInfo): string | undefined {
    return status === 'closed' ? (gitInfo.author || 'Unknown') : mapping.fixedBy;
  }

  /**
   * Get the fixCommit value based on status
   */
  private getFixCommit(status: string, mapping: any, gitInfo: GitInfo): string | undefined {
    return status === 'closed' ? (gitInfo.commit || 'Unknown') : mapping.fixCommit;
  }

  /**
   * Get the fixMessage value based on status
   */
  private getFixMessage(status: string, mapping: any, gitInfo: GitInfo): string | undefined {
    return status === 'closed' ? (gitInfo.message || '') : mapping.fixMessage;
  }

  /**
   * Get the testFilePath value with fallbacks
   */
  private getTestFilePath(mapping: any, testFilePath: string): string {
    return testFilePath || mapping.testFilePath || '';
  }

  /**
   * Get the testName value with fallbacks
   */
  private getTestName(mapping: any, testName: string): string {
    return testName || mapping.testName || '';
  }

  /**
   * Updates a mapping for a test identifier
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
    gitInfo: GitInfo = {},
    testFilePath: string = '',
    testName: string = ''
  ): void {
    const mapping = this.mappings[testIdentifier];
    if (mapping) {
      // If status is changing to closed, store git information about the fix
      const gitUpdates: Partial<IssueMapping> = {};
      if (updates.status === 'closed' && mapping.status === 'open') {
        gitUpdates.fixedBy = gitInfo.author || 'Unknown';
        gitUpdates.fixCommit = gitInfo.commit || 'Unknown';
        gitUpdates.fixMessage = gitInfo.message || '';
      }

      // Store test information for easier identification
      if (testFilePath && !mapping.testFilePath) {
        gitUpdates.testFilePath = testFilePath;
      }
      if (testName && !mapping.testName) {
        gitUpdates.testName = testName;
      }

      this.mappings[testIdentifier] = {
        ...mapping,
        ...updates,
        ...gitUpdates,
        lastUpdate: new Date().toISOString()
      };
      this.saveMappings();
    }
  }

  /**
   * Gets all mappings
   *
   * @returns All mappings
   */
  public getAllMappings(): Record<string, IssueMapping> {
    return { ...this.mappings };
  }
}
