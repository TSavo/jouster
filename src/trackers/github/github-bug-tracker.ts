import { IBugTracker, BugInfo } from '../bug-tracker.interface';
import { TestResult } from '../../types';
import { IGitHubClient } from '../../github/github-client.interface';
import { ITemplateManager } from '../../templates/template-manager.interface';
import { IMappingStore } from '../../storage/mapping-store.interface';

/**
 * GitHub bug tracker implementation
 */
export class GitHubBugTracker implements IBugTracker {
  private githubClient: IGitHubClient;
  private templateManager: ITemplateManager;
  private mappingStore: IMappingStore;
  private labels: string[];

  /**
   * Creates a new GitHub bug tracker
   *
   * @param githubClient GitHub client
   * @param templateManager Template manager
   * @param mappingStore Mapping store
   * @param labels Issue labels
   */
  constructor(
    githubClient: IGitHubClient,
    templateManager: ITemplateManager,
    mappingStore: IMappingStore,
    labels: string[] = ['bug', 'test-failure']
  ) {
    this.githubClient = githubClient;
    this.templateManager = templateManager;
    this.mappingStore = mappingStore;
    this.labels = labels;
  }

  /**
   * Initialize the bug tracker
   */
  public async initialize(): Promise<void> {
    // Check if GitHub CLI is available
    const isGitHubCliAvailable = await this.githubClient.isGitHubCliAvailable();
    if (!isGitHubCliAvailable) {
      throw new Error('GitHub CLI is not available. Please install it and authenticate with `gh auth login`.');
    }
  }

  /**
   * Check if a bug exists for a test
   *
   * @param testIdentifier Test identifier
   * @returns True if a bug exists, false otherwise
   */
  public async bugExists(testIdentifier: string): Promise<boolean> {
    const mapping = this.mappingStore.getMapping(testIdentifier);
    return !!mapping;
  }

  /**
   * Get bug information
   *
   * @param testIdentifier Test identifier
   * @returns Bug information or null if not found
   */
  public async getBug(testIdentifier: string): Promise<BugInfo | null> {
    const mapping = this.mappingStore.getMapping(testIdentifier);
    if (!mapping) {
      return null;
    }

    return {
      id: mapping.issueNumber.toString(),
      status: mapping.status as 'open' | 'closed',
      testIdentifier,
      testFilePath: mapping.testFilePath,
      testName: mapping.testName,
      lastFailure: mapping.lastFailure,
      lastUpdate: mapping.lastUpdate,
      fixedBy: mapping.fixedBy,
      fixCommit: mapping.fixCommit,
      fixMessage: mapping.fixMessage
    };
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
    // Generate issue title and body
    const title = `Test Failure: ${test.fullName}`;
    const body = await this.templateManager.generateIssueBody(test, testFilePath);

    // Create the issue
    const result = await this.githubClient.createIssue(title, body, this.labels);

    if (!result.success || !result.issueNumber) {
      throw new Error(`Failed to create issue: ${result.error}`);
    }

    // Get git information
    const gitInfo = this.templateManager.getGitInfo();

    // Store the mapping
    this.mappingStore.setMapping(
      testIdentifier,
      result.issueNumber,
      'open',
      gitInfo,
      testFilePath,
      test.fullName
    );

    // Return bug information
    return {
      id: result.issueNumber.toString(),
      status: 'open',
      testIdentifier,
      testFilePath,
      testName: test.fullName,
      lastFailure: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };
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
    // Get the mapping
    const mapping = this.mappingStore.getMapping(testIdentifier);
    if (!mapping) {
      throw new Error(`No issue found for test: ${testIdentifier}`);
    }

    // Generate comment body
    const comment = await this.templateManager.generateCommentBody(test, testFilePath);

    // Close the issue
    const result = await this.githubClient.closeIssue(mapping.issueNumber, comment);

    if (!result.success) {
      throw new Error(`Failed to close issue: ${result.error}`);
    }

    // Get git information
    const gitInfo = this.templateManager.getGitInfo();

    // Update the mapping
    this.mappingStore.updateMapping(
      testIdentifier,
      { status: 'closed' },
      gitInfo,
      testFilePath,
      test.fullName
    );

    // Return bug information
    return {
      id: mapping.issueNumber.toString(),
      status: 'closed',
      testIdentifier,
      testFilePath,
      testName: test.fullName,
      lastFailure: mapping.lastFailure,
      lastUpdate: new Date().toISOString(),
      fixedBy: gitInfo.author,
      fixCommit: gitInfo.commit,
      fixMessage: gitInfo.message
    };
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
    // Get the mapping
    const mapping = this.mappingStore.getMapping(testIdentifier);
    if (!mapping) {
      throw new Error(`No issue found for test: ${testIdentifier}`);
    }

    // Generate comment body
    const comment = await this.templateManager.generateReopenBody(test, testFilePath);

    // Reopen the issue
    const result = await this.githubClient.reopenIssue(mapping.issueNumber, comment);

    if (!result.success) {
      throw new Error(`Failed to reopen issue: ${result.error}`);
    }

    // Update the mapping
    this.mappingStore.updateMapping(
      testIdentifier,
      {
        status: 'open',
        lastFailure: new Date().toISOString()
      },
      {},
      testFilePath,
      test.fullName
    );

    // Return bug information
    return {
      id: mapping.issueNumber.toString(),
      status: 'open',
      testIdentifier,
      testFilePath,
      testName: test.fullName,
      lastFailure: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };
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
    // Get the mapping
    const mapping = this.mappingStore.getMapping(testIdentifier);
    if (!mapping) {
      throw new Error(`No issue found for test: ${testIdentifier}`);
    }

    // Update the mapping
    this.mappingStore.updateMapping(
      testIdentifier,
      {
        lastFailure: new Date().toISOString()
      },
      {},
      testFilePath,
      test.fullName
    );

    // Return bug information
    return {
      id: mapping.issueNumber.toString(),
      status: mapping.status as 'open' | 'closed',
      testIdentifier,
      testFilePath,
      testName: test.fullName,
      lastFailure: new Date().toISOString(),
      lastUpdate: mapping.lastUpdate
    };
  }

  /**
   * Get all bugs
   *
   * @returns All bugs
   */
  public async getAllBugs(): Promise<Record<string, BugInfo>> {
    const mappings = this.mappingStore.getAllMappings();
    const bugs: Record<string, BugInfo> = {};

    for (const [testIdentifier, mapping] of Object.entries(mappings)) {
      bugs[testIdentifier] = {
        id: mapping.issueNumber.toString(),
        status: mapping.status as 'open' | 'closed',
        testIdentifier,
        testFilePath: mapping.testFilePath,
        testName: mapping.testName,
        lastFailure: mapping.lastFailure,
        lastUpdate: mapping.lastUpdate,
        fixedBy: mapping.fixedBy,
        fixCommit: mapping.fixCommit,
        fixMessage: mapping.fixMessage
      };
    }

    return bugs;
  }
}
