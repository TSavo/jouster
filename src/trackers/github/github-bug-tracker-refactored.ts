import { IBugTracker, BugInfo } from '../bug-tracker.interface';
import { TestResult } from '../../types';
import { IGitHubClient } from '../../github/github-client.interface';
import { ITemplateManager } from '../../templates/template-manager.interface';
import { IMappingStore } from '../../storage/mapping-store.interface';
import { ILogger, ConsoleLogger } from '../../utils/logger.interface';

/**
 * GitHub bug tracker implementation
 */
export class GitHubBugTracker implements IBugTracker {
  private githubClient: IGitHubClient;
  private templateManager: ITemplateManager;
  private mappingStore: IMappingStore;
  private labels: string[];
  private logger: ILogger;

  /**
   * Creates a new GitHub bug tracker
   *
   * @param githubClient GitHub client
   * @param templateManager Template manager
   * @param mappingStore Mapping store
   * @param labels Issue labels
   * @param logger Logger
   */
  constructor(
    githubClient: IGitHubClient,
    templateManager: ITemplateManager,
    mappingStore: IMappingStore,
    labels: string[] = ['bug'],
    logger?: ILogger
  ) {
    this.githubClient = githubClient;
    this.templateManager = templateManager;
    this.mappingStore = mappingStore;
    this.labels = labels;
    this.logger = logger || new ConsoleLogger('Jouster');
  }

  /**
   * Initialize the bug tracker
   */
  public async initialize(): Promise<void> {
    this.logger.log('Initializing GitHub bug tracker');

    try {
      this.logger.log('Checking if GitHub CLI is available');
      const isGitHubCliAvailable = await this.githubClient.isGitHubCliAvailable();
      this.logger.log(`GitHub CLI available: ${isGitHubCliAvailable}`);

      if (!isGitHubCliAvailable) {
        this.logger.error('GitHub CLI is not available');
        throw new Error('GitHub CLI is not available. Please install it and authenticate with `gh auth login`.');
      }

      this.logger.log('GitHub bug tracker initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize GitHub bug tracker:', error);
      throw error;
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

    try {
      // Check and sync the actual status from GitHub
      await this.syncIssueStatus(testIdentifier, mapping.issueNumber);

      // Get the mapping again in case it was updated
      const updatedMapping = this.mappingStore.getMapping(testIdentifier);
      if (!updatedMapping) {
        return null;
      }

      return this.mapToBugInfo(updatedMapping, testIdentifier);
    } catch (error) {
      this.logger.error('Error getting bug information:', error);
      return null;
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
    try {
      this.logger.log('Creating bug for test:', testIdentifier);
      this.logger.log('Test full name:', test.fullName);
      this.logger.log('Test file path:', testFilePath);

      // Create a title for the issue
      const title = `Test Failure: ${test.fullName}`;
      this.logger.log('Issue title:', title);

      // Generate the issue body
      const body = await Promise.resolve(this.templateManager.generateIssueBody(test, testFilePath));
      if (body) {
        this.logger.log('Generated issue body successfully');
      }

      // Create the issue
      this.logger.log('Creating GitHub issue');
      const result = await this.githubClient.createIssue(title, body, this.labels);
      this.logger.log('GitHub issue creation result:', result);

      if (!result.success || !result.issueNumber) {
        this.logger.error('Failed to create issue:', result.error);
        throw new Error(`Failed to create issue: ${result.error}`);
      }

      // Get git information
      this.logger.log('Getting git information');
      const gitInfo = this.templateManager.getGitInfo();
      this.logger.log('Git info:', gitInfo);

      // Store the mapping in the database
      this.logger.log('Storing mapping in database');
      const now = new Date().toISOString();
      this.mappingStore.setMapping(
        testIdentifier,
        result.issueNumber,
        'open',
        gitInfo,
        testFilePath,
        test.fullName
      );

      // Update with additional fields
      this.mappingStore.updateMapping(
        testIdentifier,
        {
          lastFailure: now,
          lastUpdate: now
        },
        gitInfo,
        testFilePath,
        test.fullName
      );
      this.logger.log('Mapping stored successfully');

      // Get the mapping
      const mapping = this.mappingStore.getMapping(testIdentifier);
      if (!mapping) {
        throw new Error('Failed to get mapping after creating issue');
      }

      // Create the bug info
      const bugInfo = this.mapToBugInfo(mapping, testIdentifier);
      this.logger.log('Bug created successfully:', bugInfo);

      return bugInfo;
    } catch (error) {
      this.logger.error('Error creating bug:', error);
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
    try {
      this.logger.log('Closing bug for test:', testIdentifier);

      // Get the mapping
      const mapping = this.mappingStore.getMapping(testIdentifier);
      if (!mapping) {
        this.logger.error('No mapping found for test:', testIdentifier);
        throw new Error(`No mapping found for test: ${testIdentifier}`);
      }

      // Generate the comment body
      const comment = await Promise.resolve(this.templateManager.generateCommentBody(test, testFilePath));
      this.logger.log('Generated comment body successfully');

      // Close the issue
      this.logger.log('Closing GitHub issue:', mapping.issueNumber);
      const result = await this.githubClient.closeIssue(mapping.issueNumber, comment);
      this.logger.log('GitHub issue close result:', result);

      if (!result.success) {
        this.logger.error('Failed to close issue:', result.error);
        throw new Error(`Failed to close issue: ${result.error}`);
      }

      // Get git information
      this.logger.log('Getting git information');
      const gitInfo = this.templateManager.getGitInfo();
      this.logger.log('Git info:', gitInfo);

      // Update the mapping in the database
      this.logger.log('Updating mapping in database');
      const now = new Date().toISOString();
      const updates = {
        status: 'closed',
        lastUpdate: now,
        fixedBy: gitInfo.author,
        fixCommit: gitInfo.commit,
        fixMessage: gitInfo.message
      };
      this.mappingStore.updateMapping(
        testIdentifier,
        updates,
        gitInfo,
        testFilePath,
        test.fullName
      );
      this.logger.log('Mapping updated successfully');

      // Get the mapping again
      const updatedMapping = this.mappingStore.getMapping(testIdentifier);
      if (!updatedMapping) {
        throw new Error('Failed to get mapping after closing issue');
      }

      // Create the bug info
      const bugInfo = this.mapToBugInfo(updatedMapping, testIdentifier);
      this.logger.log('Bug closed successfully:', bugInfo);

      return bugInfo;
    } catch (error) {
      this.logger.error('Error closing bug:', error);
      throw error;
    }
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
    try {
      this.logger.log('Reopening bug for test:', testIdentifier);

      // Get the mapping
      const mapping = this.mappingStore.getMapping(testIdentifier);
      if (!mapping) {
        this.logger.error('No mapping found for test:', testIdentifier);
        throw new Error(`No mapping found for test: ${testIdentifier}`);
      }

      // Generate the comment body
      const comment = await Promise.resolve(this.templateManager.generateReopenBody(test, testFilePath));
      this.logger.log('Generated reopen body successfully');

      // Reopen the issue
      this.logger.log('Reopening GitHub issue:', mapping.issueNumber);
      const result = await this.githubClient.reopenIssue(mapping.issueNumber, comment);
      this.logger.log('GitHub issue reopen result:', result);

      if (!result.success) {
        this.logger.error('Failed to reopen issue:', result.error);
        throw new Error(`Failed to reopen issue: ${result.error}`);
      }

      // Get git information
      this.logger.log('Getting git information');
      const gitInfo = this.templateManager.getGitInfo();
      this.logger.log('Git info:', gitInfo);

      // Update the mapping in the database
      this.logger.log('Updating mapping in database');
      const now = new Date().toISOString();
      const updates = {
        status: 'open',
        lastFailure: now,
        lastUpdate: now
      };
      this.mappingStore.updateMapping(
        testIdentifier,
        updates,
        gitInfo,
        testFilePath,
        test.fullName
      );
      this.logger.log('Mapping updated successfully');

      // Get the mapping again
      const updatedMapping = this.mappingStore.getMapping(testIdentifier);
      if (!updatedMapping) {
        throw new Error('Failed to get mapping after reopening issue');
      }

      // Create the bug info
      const bugInfo = this.mapToBugInfo(updatedMapping, testIdentifier);
      this.logger.log('Bug reopened successfully:', bugInfo);

      return bugInfo;
    } catch (error) {
      this.logger.error('Error reopening bug:', error);
      throw error;
    }
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
    try {
      this.logger.log('Updating bug for test:', testIdentifier);

      // Get the mapping
      const mapping = this.mappingStore.getMapping(testIdentifier);
      if (!mapping) {
        this.logger.error('No mapping found for test:', testIdentifier);
        throw new Error(`No mapping found for test: ${testIdentifier}`);
      }

      // Generate the comment body
      const comment = await Promise.resolve(this.templateManager.generateCommentBody(test, testFilePath));
      this.logger.log('Generated comment body successfully');

      // Add a comment to the issue
      this.logger.log('Adding comment to GitHub issue:', mapping.issueNumber);
      const result = await this.githubClient.createIssue(
        `Update for test: ${test.fullName}`,
        comment,
        this.labels
      );
      this.logger.log('GitHub issue comment result:', result);

      if (!result.success) {
        this.logger.error('Failed to add comment to issue:', result.error);
        throw new Error(`Failed to add comment to issue: ${result.error}`);
      }

      // Get git information
      this.logger.log('Getting git information');
      const gitInfo = this.templateManager.getGitInfo();
      this.logger.log('Git info:', gitInfo);

      // Update the mapping in the database
      this.logger.log('Updating mapping in database');
      const now = new Date().toISOString();
      const updates = {
        lastUpdate: now
      };
      this.mappingStore.updateMapping(
        testIdentifier,
        updates,
        gitInfo,
        testFilePath,
        test.fullName
      );
      this.logger.log('Mapping updated successfully');

      // Get the mapping again
      const updatedMapping = this.mappingStore.getMapping(testIdentifier);
      if (!updatedMapping) {
        throw new Error('Failed to get mapping after updating issue');
      }

      // Create the bug info
      const bugInfo = this.mapToBugInfo(updatedMapping, testIdentifier);
      this.logger.log('Bug updated successfully:', bugInfo);

      return bugInfo;
    } catch (error) {
      this.logger.error('Error updating bug:', error);
      throw error;
    }
  }

  /**
   * Get all bugs
   *
   * @returns All bugs
   */
  public async getAllBugs(): Promise<Record<string, BugInfo>> {
    try {
      this.logger.log('Getting all bugs');

      // Get all mappings
      const mappings = this.mappingStore.getAllMappings();
      this.logger.log('Found mappings:', Object.keys(mappings).length);

      // Convert mappings to bug info
      const bugs: Record<string, BugInfo> = {};
      for (const [testIdentifier, mapping] of Object.entries(mappings)) {
        bugs[testIdentifier] = this.mapToBugInfo(mapping, testIdentifier);
      }

      this.logger.log('Returning all bugs:', Object.keys(bugs).length);
      return bugs;
    } catch (error) {
      this.logger.error('Error getting all bugs:', error);
      return {};
    }
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
      this.logger.log('Syncing issue status for:', testIdentifier, 'Issue number:', issueNumber);

      // Get the current mapping
      const mapping = this.mappingStore.getMapping(testIdentifier);
      if (!mapping) {
        this.logger.log('No mapping found for test:', testIdentifier);
        return false;
      }

      // Check the actual status on GitHub
      const statusResult = await this.githubClient.checkIssueStatus(issueNumber);

      if (!statusResult.success) {
        this.logger.error('Failed to check issue status:', statusResult.error);
        return false;
      }

      const githubStatus = statusResult.status;
      this.logger.log('GitHub status:', githubStatus, 'Local status:', mapping.status);

      // If the status is different, update the mapping
      if (githubStatus !== mapping.status) {
        this.logger.log('Status mismatch, updating mapping');

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

        this.logger.log('Mapping updated successfully');
        return true;
      }

      this.logger.log('Status is in sync, no update needed');
      return true;
    } catch (error) {
      this.logger.error('Error syncing issue status:', error);
      return false;
    }
  }

  /**
   * Map a mapping to a bug info object
   *
   * @param mapping Mapping
   * @param testIdentifier Test identifier
   * @returns Bug info
   */
  private mapToBugInfo(mapping: any, testIdentifier: string): BugInfo {
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
}
