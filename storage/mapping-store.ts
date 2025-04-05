import fs from 'fs';
import path from 'path';
import { 
  MappingDatabase, 
  TestIdentifier, 
  TestIssueMapping, 
  IssueStatus 
} from '../types';

/**
 * Manages the persistent storage of test-to-issue mappings
 */
export class MappingStore {
  private database: MappingDatabase;
  private databasePath: string;
  private hasChanges: boolean = false;

  /**
   * Creates a new MappingStore instance
   * 
   * @param databasePath Path to the database file
   */
  constructor(databasePath?: string) {
    this.databasePath = databasePath || path.join(process.cwd(), 'test-issue-mapping.json');
    this.database = this.loadDatabase();
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
   * Gets the issue mapping for a test
   * 
   * @param testIdentifier The test identifier
   * @returns The issue mapping or undefined if not found
   */
  public getIssueMapping(testIdentifier: TestIdentifier): TestIssueMapping | undefined {
    return this.database.testIdentifiers[testIdentifier];
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
   * Updates the status of an issue
   * 
   * @param testIdentifier The test identifier
   * @param status The new status
   * @returns Whether the update was successful
   */
  public updateIssueStatus(testIdentifier: TestIdentifier, status: IssueStatus): boolean {
    const mapping = this.getIssueMapping(testIdentifier);
    if (!mapping) {
      return false;
    }

    mapping.status = status;
    mapping.lastUpdate = new Date().toISOString();
    this.hasChanges = true;
    return true;
  }

  /**
   * Gets all test identifiers with their mappings
   * 
   * @returns An array of [testIdentifier, mapping] pairs
   */
  public getAllMappings(): [TestIdentifier, TestIssueMapping][] {
    return Object.entries(this.database.testIdentifiers);
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
