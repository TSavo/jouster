import fs from 'fs';
import path from 'path';
import {
  MappingDatabase,
  TestIdentifier,
  TestIssueMapping,
  IssueStatus
} from '../types';

/**
 * Storage client interface
 */
export interface IStorageClient {
  getMapping(testIdentifier: string): any;
  setMapping(testIdentifier: string, issueNumber: number, status: string, gitInfo?: any, testFilePath?: string, testName?: string): void;
  updateMapping(testIdentifier: string, updates: any, gitInfo?: any, testFilePath?: string, testName?: string): void;
  getAllMappings(): Record<string, any>;
}

/**
 * Manages the persistent storage of test-to-issue mappings
 */
export class MappingStore {
  private database: MappingDatabase;
  private databasePath: string;
  private hasChanges: boolean = false;
  private storageClient?: IStorageClient;

  /**
   * Creates a new MappingStore instance
   *
   * @param databasePathOrClient Path to the database file or storage client
   */
  constructor(databasePathOrClient?: string | IStorageClient) {
    if (typeof databasePathOrClient === 'object' && databasePathOrClient !== null) {
      // Use provided storage client
      this.storageClient = databasePathOrClient;
      this.databasePath = '';
      this.database = { testIdentifiers: {} };
    } else {
      // Use file-based storage
      this.databasePath = typeof databasePathOrClient === 'string' ? databasePathOrClient : path.join(process.cwd(), 'test-issue-mapping.json');
      this.database = this.loadDatabase();
    }
  }

  /**
   * Loads the database from disk
   *
   * @returns The loaded database or a new empty database
   */
  private loadDatabase(): MappingDatabase {
    try {
      if (fs.existsSync(this.databasePath)) {
        const data = fs.readFileSync(this.databasePath, 'utf8');
        return JSON.parse(data) as MappingDatabase;
      }
    } catch (error) {
      console.error(`Error loading mapping database: ${error}`);
    }

    // Return empty database if file doesn't exist or has errors
    return { testIdentifiers: {} };
  }

  /**
   * Saves the database to disk if there are changes
   */
  public saveDatabase(): void {
    if (!this.hasChanges) {
      return;
    }

    try {
      // Ensure the directory exists
      const dir = path.dirname(this.databasePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write to a temporary file first
      const tempPath = `${this.databasePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.database, null, 2), 'utf8');

      // Rename to the actual file (atomic operation)
      fs.renameSync(tempPath, this.databasePath);

      this.hasChanges = false;
    } catch (error) {
      console.error(`Error saving mapping database: ${error}`);
    }
  }

  /**
   * Gets the mapping for a test
   *
   * @param testIdentifier Test identifier
   * @returns The mapping or undefined if not found
   */
  public getMapping(testIdentifier: TestIdentifier): TestIssueMapping | undefined {
    if (this.storageClient) {
      return this.storageClient.getMapping(testIdentifier);
    }
    return this.database.testIdentifiers[testIdentifier];
  }

  /**
   * Gets the issue mapping for a test (alias for getMapping)
   *
   * @param testIdentifier The test identifier
   * @returns The issue mapping or undefined if not found
   */
  public getIssueMapping(testIdentifier: TestIdentifier): TestIssueMapping | undefined {
    return this.getMapping(testIdentifier);
  }

  /**
   * Sets the mapping for a test
   *
   * @param testIdentifier The test identifier
   * @param issueNumber The issue number
   * @param status The issue status
   * @param gitInfo Optional git information
   * @param testFilePath Optional test file path
   * @param testName Optional test name
   */
  public setMapping(
    testIdentifier: TestIdentifier,
    issueNumber: number,
    status: string,
    gitInfo?: { author?: string; commit?: string; message?: string },
    testFilePath?: string,
    testName?: string
  ): void {
    if (this.storageClient) {
      this.storageClient.setMapping(testIdentifier, issueNumber, status, gitInfo, testFilePath, testName);
      return;
    }

    const mapping: TestIssueMapping = {
      issueNumber,
      status,
      lastFailure: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      fixedBy: gitInfo?.author,
      fixCommit: gitInfo?.commit,
      fixMessage: gitInfo?.message,
      testFilePath,
      testName
    };

    this.database.testIdentifiers[testIdentifier] = mapping;
    this.hasChanges = true;
    this.saveDatabase();
  }

  /**
   * Sets the issue mapping for a test
   *
   * @param testIdentifier The test identifier
   * @param mapping The issue mapping
   */
  public setIssueMapping(testIdentifier: TestIdentifier, mapping: TestIssueMapping): void {
    this.database.testIdentifiers[testIdentifier] = mapping;
    this.hasChanges = true;
  }

  /**
   * Updates a mapping
   *
   * @param testIdentifier The test identifier
   * @param updates The updates to apply
   * @param gitInfo Optional git information
   * @param testFilePath Optional test file path
   * @param testName Optional test name
   * @returns Whether the update was successful
   */
  public updateMapping(
    testIdentifier: TestIdentifier,
    updates: Partial<TestIssueMapping>,
    gitInfo?: { author?: string; commit?: string; message?: string },
    testFilePath?: string,
    testName?: string
  ): boolean {
    if (this.storageClient) {
      this.storageClient.updateMapping(testIdentifier, updates, gitInfo, testFilePath, testName);
      return true;
    }

    const mapping = this.getIssueMapping(testIdentifier);
    if (!mapping) {
      return false;
    }

    // Apply updates
    Object.assign(mapping, updates);

    // Update git info if provided
    if (gitInfo) {
      mapping.fixedBy = gitInfo.author;
      mapping.fixCommit = gitInfo.commit;
      mapping.fixMessage = gitInfo.message;
    }

    // Update test info if provided
    if (testFilePath) {
      mapping.testFilePath = testFilePath;
    }

    if (testName) {
      mapping.testName = testName;
    }

    mapping.lastUpdate = new Date().toISOString();
    this.hasChanges = true;
    this.saveDatabase();
    return true;
  }

  /**
   * Updates the status of an issue
   *
   * @param testIdentifier The test identifier
   * @param status The new status
   * @returns Whether the update was successful
   */
  public updateIssueStatus(testIdentifier: TestIdentifier, status: IssueStatus): boolean {
    return this.updateMapping(testIdentifier, { status });
  }

  /**
   * Gets all mappings
   *
   * @returns A record of test identifiers to mappings
   */
  public getAllMappings(): Record<TestIdentifier, TestIssueMapping> {
    if (this.storageClient) {
      return this.storageClient.getAllMappings();
    }
    return this.database.testIdentifiers;
  }

  /**
   * Gets all test identifiers with their mappings as entries
   *
   * @returns An array of [testIdentifier, mapping] pairs
   */
  public getAllMappingEntries(): [TestIdentifier, TestIssueMapping][] {
    return Object.entries(this.getAllMappings());
  }

  /**
   * Removes a mapping from the database
   *
   * @param testIdentifier The test identifier
   * @returns Whether the removal was successful
   */
  public removeMapping(testIdentifier: TestIdentifier): boolean {
    if (this.database.testIdentifiers[testIdentifier]) {
      delete this.database.testIdentifiers[testIdentifier];
      this.hasChanges = true;
      return true;
    }
    return false;
  }
}
