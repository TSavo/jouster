import { IssueTrackerConfig } from '../config';
import * as path from 'path';
import minimatch from 'minimatch';
import { execSync } from 'child_process';

/**
 * Filter utility for test files and branches
 */
export class FilterUtils {
  private config: Partial<IssueTrackerConfig>;

  /**
   * Create a new filter utility
   *
   * @param config Issue tracker configuration
   */
  constructor(config: Partial<IssueTrackerConfig> = {}) {
    this.config = config;
  }

  /**
   * Check if a test file should be included based on test filters
   *
   * @param testFilePath Path to the test file
   * @returns True if the test file should be included, false otherwise
   */
  public shouldIncludeTest(testFilePath: string): boolean {
    const testFilters = this.config.testFilters || { include: ['*'], exclude: [] };
    const includePatterns = testFilters.include || ['*'];
    const excludePatterns = testFilters.exclude || [];

    // Normalize path for consistent matching
    const normalizedPath = path.normalize(testFilePath);

    // Check if the file matches any exclude pattern
    for (const pattern of excludePatterns) {
      if (this.matchesGlobPattern(normalizedPath, pattern)) {
        return false;
      }
    }

    // Check if the file matches any include pattern
    for (const pattern of includePatterns) {
      if (pattern === '*' || this.matchesGlobPattern(normalizedPath, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if the current branch should create issues based on branch filters
   *
   * @returns True if issues should be created on the current branch, false otherwise
   */
  public shouldCreateIssuesOnCurrentBranch(): boolean {
    const branchFilters = this.config.branchFilters || { include: ['.*'], exclude: [] };
    const includePatterns = branchFilters.include || ['.*'];
    const excludePatterns = branchFilters.exclude || [];

    // Get current branch name
    const currentBranch = this.getCurrentBranch();

    // Check if the branch matches any exclude pattern
    if (excludePatterns.some(pattern => this.matchesRegexPattern(currentBranch, pattern))) {
      return false;
    }

    // Check if the branch matches any include pattern
    return includePatterns.some(pattern => this.matchesRegexPattern(currentBranch, pattern));
  }

  /**
   * Check if issue creation should be skipped for a test file
   *
   * @param testFilePath Path to the test file
   * @returns True if issue creation should be skipped, false otherwise
   */
  public shouldSkipIssueCreation(testFilePath: string): boolean {
    const templateExceptions = this.config.templateExceptions || { skipIssueCreation: [] };
    const skipPatterns = templateExceptions.skipIssueCreation || [];

    // Normalize path for consistent matching
    const normalizedPath = path.normalize(testFilePath);

    // Check if the file matches any skip pattern
    return skipPatterns.some(pattern => this.matchesGlobPattern(normalizedPath, pattern));
  }

  /**
   * Get custom template for a test file if available
   *
   * @param testFilePath Path to the test file
   * @returns Custom template name if available, undefined otherwise
   */
  public getCustomTemplate(testFilePath: string): string | undefined {
    const templateExceptions = this.config.templateExceptions || { customTemplates: [] };
    const customTemplates = templateExceptions.customTemplates || [];

    // Normalize path for consistent matching
    const normalizedPath = path.normalize(testFilePath);

    // Find matching custom template
    const matchingTemplate = customTemplates.find(template =>
      this.matchesGlobPattern(normalizedPath, template.pattern)
    );

    return matchingTemplate?.template;
  }

  /**
   * Check if a path matches a glob pattern
   *
   * @param filePath File path to check
   * @param pattern Glob pattern to match against
   * @returns True if the path matches the pattern, false otherwise
   */
  private matchesGlobPattern(filePath: string, pattern: string): boolean {
    return minimatch(filePath, pattern);
  }

  /**
   * Check if a string matches a regex pattern
   *
   * @param str String to check
   * @param pattern Regex pattern to match against
   * @returns True if the string matches the pattern, false otherwise
   */
  private matchesRegexPattern(str: string, pattern: string): boolean {
    const regex = new RegExp(pattern);
    return regex.test(str);
  }

  /**
   * Get the current git branch name
   *
   * @returns Current branch name
   */
  private getCurrentBranch(): string {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    } catch (error) {
      // Default to 'main' if git command fails
      return 'main';
    }
  }
}
