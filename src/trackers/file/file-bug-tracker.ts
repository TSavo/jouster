import fs from 'fs';
import path from 'path';
import { IBugTracker, BugInfo } from '../bug-tracker.interface';
import { TestResult } from '../../types';
import { ITemplateManager } from '../../templates/template-manager.interface';

/**
 * File system bug tracker implementation
 */
export class FileBugTracker implements IBugTracker {
  private baseDir: string;
  private templateManager: ITemplateManager;
  private bugs: Record<string, BugInfo> = {};

  /**
   * Creates a new file system bug tracker
   * 
   * @param baseDir Base directory for bug files
   * @param templateManager Template manager
   */
  constructor(baseDir: string, templateManager: ITemplateManager) {
    this.baseDir = baseDir;
    this.templateManager = templateManager;
  }

  /**
   * Initialize the bug tracker
   */
  public async initialize(): Promise<void> {
    // Create the base directory if it doesn't exist
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }

    // Load all bugs
    await this.loadBugs();
  }

  /**
   * Check if a bug exists for a test
   * 
   * @param testIdentifier Test identifier
   * @returns True if a bug exists, false otherwise
   */
  public async bugExists(testIdentifier: string): Promise<boolean> {
    return !!this.bugs[testIdentifier];
  }

  /**
   * Get bug information
   * 
   * @param testIdentifier Test identifier
   * @returns Bug information or null if not found
   */
  public async getBug(testIdentifier: string): Promise<BugInfo | null> {
    return this.bugs[testIdentifier] || null;
  }

  /**
   * Create a new bug
   * 
   * @param testIdentifier Test identifier
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Bug information
   */
  public async createBug(testIdentifier: string, test: TestResult, testFilePath: string): Promise<BugInfo> {
    // Generate bug ID
    const bugId = this.generateBugId();

    // Create bug information
    const bug: BugInfo = {
      id: bugId,
      status: 'open',
      testIdentifier,
      testFilePath,
      testName: test.fullName,
      lastFailure: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };

    // Save the bug
    await this.saveBug(testIdentifier, bug);

    // Return bug information
    return bug;
  }

  /**
   * Close a bug
   * 
   * @param testIdentifier Test identifier
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Bug information
   */
  public async closeBug(testIdentifier: string, test: TestResult, testFilePath: string): Promise<BugInfo> {
    // Get the bug
    const bug = this.bugs[testIdentifier];
    if (!bug) {
      throw new Error(`No bug found for test: ${testIdentifier}`);
    }

    // Get git information
    const gitInfo = this.templateManager.getGitInfo();

    // Update the bug
    bug.status = 'closed';
    bug.lastUpdate = new Date().toISOString();
    bug.fixedBy = gitInfo.author;
    bug.fixCommit = gitInfo.commit;
    bug.fixMessage = gitInfo.message;

    // Save the bug
    await this.saveBug(testIdentifier, bug);

    // Return bug information
    return bug;
  }

  /**
   * Reopen a bug
   * 
   * @param testIdentifier Test identifier
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Bug information
   */
  public async reopenBug(testIdentifier: string, test: TestResult, testFilePath: string): Promise<BugInfo> {
    // Get the bug
    const bug = this.bugs[testIdentifier];
    if (!bug) {
      throw new Error(`No bug found for test: ${testIdentifier}`);
    }

    // Update the bug
    bug.status = 'open';
    bug.lastFailure = new Date().toISOString();
    bug.lastUpdate = new Date().toISOString();

    // Save the bug
    await this.saveBug(testIdentifier, bug);

    // Return bug information
    return bug;
  }

  /**
   * Update a bug
   * 
   * @param testIdentifier Test identifier
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Bug information
   */
  public async updateBug(testIdentifier: string, test: TestResult, testFilePath: string): Promise<BugInfo> {
    // Get the bug
    const bug = this.bugs[testIdentifier];
    if (!bug) {
      throw new Error(`No bug found for test: ${testIdentifier}`);
    }

    // Update the bug
    bug.lastFailure = new Date().toISOString();
    bug.testFilePath = testFilePath;
    bug.testName = test.fullName;

    // Save the bug
    await this.saveBug(testIdentifier, bug);

    // Return bug information
    return bug;
  }

  /**
   * Get all bugs
   * 
   * @returns All bugs
   */
  public async getAllBugs(): Promise<Record<string, BugInfo>> {
    return { ...this.bugs };
  }

  /**
   * Generate a bug ID
   * 
   * @returns Bug ID
   */
  private generateBugId(): string {
    return Date.now().toString();
  }

  /**
   * Save a bug
   * 
   * @param testIdentifier Test identifier
   * @param bug Bug information
   */
  private async saveBug(testIdentifier: string, bug: BugInfo): Promise<void> {
    // Update the in-memory cache
    this.bugs[testIdentifier] = bug;

    // Save to file
    const filePath = this.getBugFilePath(testIdentifier);
    fs.writeFileSync(filePath, JSON.stringify(bug, null, 2));
  }

  /**
   * Load all bugs
   */
  private async loadBugs(): Promise<void> {
    // Clear the in-memory cache
    this.bugs = {};

    // Read all files in the base directory
    const files = fs.readdirSync(this.baseDir);

    // Load each bug
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(this.baseDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const bug = JSON.parse(content) as BugInfo;
        this.bugs[bug.testIdentifier] = bug;
      }
    }
  }

  /**
   * Get the file path for a bug
   * 
   * @param testIdentifier Test identifier
   * @returns File path
   */
  private getBugFilePath(testIdentifier: string): string {
    return path.join(this.baseDir, `${testIdentifier}.json`);
  }
}
