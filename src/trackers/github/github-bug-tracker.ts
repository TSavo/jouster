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
    labels: string[] = ['bug']
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
    console.log('[Jouster] Initializing GitHub bug tracker');

    // Check if GitHub CLI is available
    console.log('[Jouster] Checking if GitHub CLI is available');
    const isGitHubCliAvailable = await this.githubClient.isGitHubCliAvailable();
    console.log('[Jouster] GitHub CLI available:', isGitHubCliAvailable);

    if (!isGitHubCliAvailable) {
      console.error('[Jouster] GitHub CLI is not available');
      throw new Error('GitHub CLI is not available. Please install it and authenticate with `gh auth login`.');
    }

    console.log('[Jouster] GitHub bug tracker initialized successfully');
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

    // Check and sync the actual status from GitHub
    await this.syncIssueStatus(testIdentifier, mapping.issueNumber);

    // Get the mapping again in case it was updated
    const updatedMapping = this.mappingStore.getMapping(testIdentifier);
    if (!updatedMapping) {
      return null;
    }

    return {
      id: updatedMapping.issueNumber.toString(),
      status: updatedMapping.status as 'open' | 'closed',
      testIdentifier,
      testFilePath: updatedMapping.testFilePath,
      testName: updatedMapping.testName,
      lastFailure: updatedMapping.lastFailure,
      lastUpdate: updatedMapping.lastUpdate,
      fixedBy: updatedMapping.fixedBy,
      fixCommit: updatedMapping.fixCommit,
      fixMessage: updatedMapping.fixMessage
    };
  }

  /**
   * Sync the issue status with GitHub
   *
   * @param testIdentifier Test identifier
   * @param issueNumber GitHub issue number
   * @returns True if the status was synced, false otherwise
   */
  public async syncIssueStatus(testIdentifier: string, issueNumber: number): Promise<boolean> {
    try {
      console.log('[Jouster] Syncing issue status for:', testIdentifier, 'Issue number:', issueNumber);

      // Get the current mapping
      const mapping = this.mappingStore.getMapping(testIdentifier);
      if (!mapping) {
        console.log('[Jouster] No mapping found for test:', testIdentifier);
        return false;
      }

      // Check the actual status on GitHub
      const statusResult = await this.githubClient.checkIssueStatus(issueNumber);

      if (!statusResult.success) {
        console.error('[Jouster] Failed to check issue status:', statusResult.error);
        return false;
      }

      const githubStatus = statusResult.status;
      console.log('[Jouster] GitHub status:', githubStatus, 'Local status:', mapping.status);

      // If the status is different, update the mapping
      if (githubStatus !== mapping.status) {
        console.log('[Jouster] Status mismatch, updating mapping');

        // Get git information
        const gitInfo = this.templateManager.getGitInfo();

        // Update the mapping
        this.mappingStore.updateMapping(
          testIdentifier,
          { status: githubStatus },
          gitInfo,
          mapping.testFilePath || '',
          mapping.testName || ''
        );

        console.log('[Jouster] Mapping updated successfully');
        return true;
      }

      console.log('[Jouster] Status is in sync, no update needed');
      return true;
    } catch (error) {
      console.error('[Jouster] Error syncing issue status:', error);
      return false;
    }
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
    console.log('[Jouster] Creating bug for test:', testIdentifier);
    console.log('[Jouster] Test full name:', test.fullName);
    console.log('[Jouster] Test file path:', testFilePath);

    // Generate issue title and body
    const title = `Test Failure: ${test.fullName}`;
    console.log('[Jouster] Issue title:', title);

    try {
      const body = await this.templateManager.generateIssueBody(test, testFilePath);
      console.log('[Jouster] Generated issue body successfully');

      // Create the issue
      console.log('[Jouster] Creating GitHub issue');
      const result = await this.githubClient.createIssue(title, body, this.labels);
      console.log('[Jouster] GitHub issue creation result:', result);

      if (!result.success || !result.issueNumber) {
        console.error('[Jouster] Failed to create issue:', result.error);
        throw new Error(`Failed to create issue: ${result.error}`);
      }

      // Get git information
      console.log('[Jouster] Getting git information');
      const gitInfo = this.templateManager.getGitInfo();
      console.log('[Jouster] Git info:', gitInfo);

      // Store the mapping
      console.log('[Jouster] Storing mapping in database');
      this.mappingStore.setMapping(
        testIdentifier,
        result.issueNumber,
        'open',
        gitInfo,
        testFilePath,
        test.fullName
      );
      console.log('[Jouster] Mapping stored successfully');

      // Return bug information
      const bugInfo = {
        id: result.issueNumber.toString(),
        status: 'open',
        testIdentifier,
        testFilePath,
        testName: test.fullName,
        lastFailure: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      };

      console.log('[Jouster] Bug created successfully:', bugInfo);
      return bugInfo;
    } catch (error) {
      console.error('[Jouster] Error creating bug:', error);
      throw error;
    }
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
