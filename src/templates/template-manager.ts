import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import os from 'os';
import { ITemplateManager } from './template-manager.interface';
import { TestResult, ErrorInfo } from '../types';
import { ErrorUtils } from '../utils/error-utils';
import { GitUtils, GitInfo } from '../utils/git-utils';
import { FilterUtils } from '../utils/filter-utils';
import { IssueTrackerConfig } from '../config';
import { HookManager } from '../hooks/hook-manager';
import { TemplateDataHook } from '../hooks/hook.interface';
import { TemplateFactory, TemplateType } from './template-factory';

/**
 * Template manager implementation
 */
export class TemplateManager implements ITemplateManager {
  private templates: Record<string, Handlebars.TemplateDelegate>;
  private templateDir: string;
  private filterUtils: FilterUtils;
  private config: Partial<IssueTrackerConfig>;
  private hookManager: HookManager;

  /**
   * Creates a new template manager
   *
   * @param templateDir Template directory
   * @param config Issue tracker configuration
   */
  constructor(templateDir?: string, config?: Partial<IssueTrackerConfig>) {
    this.templateDir = templateDir || path.join(__dirname, '../../templates');
    this.templates = {};
    this.config = config || {};

    // Ensure hooks is always initialized
    if (this.config.hooks === undefined) {
      this.config.hooks = [];
    }

    this.filterUtils = new FilterUtils(this.config);
    this.hookManager = new HookManager(this.config.hooks);
    this.loadTemplates();
  }

  /**
   * Register a template data hook
   *
   * @param hook Hook to register
   */
  public registerHook(hook: TemplateDataHook): void {
    this.hookManager.registerHook(hook);
  }

  /**
   * Loads all templates
   */
  private loadTemplates(): void {
    // Load issue template
    this.templates.issue = Handlebars.compile(
      fs.readFileSync(path.join(this.templateDir, 'issue-template.hbs'), 'utf8')
    );

    // Load close comment template
    this.templates.closeComment = Handlebars.compile(
      fs.readFileSync(path.join(this.templateDir, 'close-comment-template.hbs'), 'utf8')
    );

    // Load reopen comment template
    this.templates.reopenComment = Handlebars.compile(
      fs.readFileSync(path.join(this.templateDir, 'reopen-comment-template.hbs'), 'utf8')
    );

    // Register helpers
    Handlebars.registerHelper('ifEquals', function(this: any, arg1: any, arg2: any, options: any) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('dateFormat', function(this: any, date: any) {
      if (!date) return '';
      return new Date(date).toLocaleString();
    });
  }

  /**
   * Generate issue body from test result
   *
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Issue body
   */
  public async generateIssueBody(test: TestResult, testFilePath: string): Promise<string> {
    // Extract test suite name and test name using our regex-powered method
    const fullTestName = test.fullName;
    const { testSuite, testName } = this.parseTestName(fullTestName);

    // Get git information
    const gitInfo = this.getGitInfo();

    // Get environment information
    // const envInfo = this.getEnvironmentInfo();

    // Extract error information
    const errorInfo = this.extractErrorInfo(test.failureMessages);

    // Extract Jest-specific information
    const jestInfo = this.extractJestInfo(test);

    // Get code snippet
    const codeSnippet = this.extractCodeSnippet(testFilePath, errorInfo.lineNumber);

    // Check for custom template
    const customTemplate = this.filterUtils.getCustomTemplate(testFilePath);

    // Prepare template data
    let templateData = {
      // Basic test information
      testName,
      testFilePath,
      fullTestName,
      testSuite,
      ancestorTitles: this.getAncestorTitles(test),
      duration: test.duration,
      failureTime: new Date().toISOString(),

      // Git information
      branchName: gitInfo.branch,
      commitHash: gitInfo.commit,
      commitMessage: gitInfo.message,
      commitAuthor: gitInfo.author,

      // Environment information
      nodeVersion: process.version,
      osInfo: `${os.platform()} ${os.release()}`,
      environment: process.env.CI ? 'CI' : 'Local',
      ciInfo: process.env.CI ? {
        buildUrl: process.env.BUILD_URL || process.env.CI_BUILD_URL || 'Unknown',
        jobName: process.env.JOB_NAME || process.env.CI_JOB_NAME || 'Unknown'
      } : null,

      // Error information
      errorMessage: errorInfo.message,
      stackTrace: errorInfo.stack,
      errorType: errorInfo.type,
      errorLocation: errorInfo.location,

      // Jest-specific information
      jestInfo,
      numPassingAsserts: test.numPassingAsserts || 0,
      status: test.status,

      // Code information
      codeLanguage: this.getFileExtension(testFilePath),
      codeSnippet,

      // History information
      previousOccurrences: 0, // This would be populated from mapping data
      lastFixedDate: null, // This would be populated from mapping data

      // Analysis
      possibleCauses: this.analyzePossibleCauses(errorInfo.message, testFilePath)
    };

    // Process template data through hooks
    templateData = await this.hookManager.processIssueData(templateData as Record<string, any>, test, testFilePath) as typeof templateData;

    // Get the appropriate template using the factory
    const template = TemplateFactory.getTemplate(TemplateType.ISSUE, customTemplate, this.templates);

    // Generate and return the content
    return template.generate(test, testFilePath, templateData);
  }

  /**
   * Generate comment body from test result
   *
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Comment body
   */
  public async generateCommentBody(test: TestResult, testFilePath: string): Promise<string> {
    // Extract test suite name and test name using our regex-powered method
    const fullTestName = test.fullName;
    const { testSuite, testName } = this.parseTestName(fullTestName);

    // Get git information
    const gitInfo = this.getGitInfo();

    // Get environment information
    // const envInfo = this.getEnvironmentInfo();

    // Check for custom template
    const customTemplate = this.filterUtils.getCustomTemplate(testFilePath);

    // Prepare template data
    let templateData = {
      // Basic test information
      testName,
      testFilePath,
      fullTestName,
      testSuite,
      ancestorTitles: this.getAncestorTitles(test),
      duration: test.duration,

      // Git information
      commitHash: gitInfo.commit,
      commitMessage: gitInfo.message,
      commitAuthor: gitInfo.author,
      branchName: gitInfo.branch,

      // Environment information
      nodeVersion: process.version,
      osInfo: `${os.platform()} ${os.release()}`,

      // Resolution information
      fixedTime: new Date().toISOString(),

      // Jest-specific information
      status: test.status,
      numPassingAsserts: this.getNumPassingAsserts(test),

      // Additional information
      fixNotes: '' // This could be populated from commit messages or PR descriptions
    };

    // Process template data through hooks
    templateData = await this.hookManager.processCloseData(templateData as Record<string, any>, test, testFilePath) as typeof templateData;

    // Get the appropriate template using the factory
    const template = TemplateFactory.getTemplate(TemplateType.CLOSE_COMMENT, customTemplate, this.templates);

    // Generate and return the content
    return template.generate(test, testFilePath, templateData);
  }

  /**
   * Generate reopen body from test result
   *
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Reopen body
   */
  public async generateReopenBody(test: TestResult, testFilePath: string): Promise<string> {
    // Extract test suite name and test name using our regex-powered method
    const fullTestName = test.fullName;
    const { testSuite, testName } = this.parseTestName(fullTestName);

    // Get git information
    const gitInfo = this.getGitInfo();

    // Check for custom template
    const customTemplate = this.filterUtils.getCustomTemplate(testFilePath);

    // Extract error information
    const errorInfo = this.extractErrorInfo(test.failureMessages);

    // Extract Jest-specific information
    const jestInfo = this.extractJestInfo(test);

    // Get code snippet
    const codeSnippet = this.extractCodeSnippet(testFilePath, errorInfo.lineNumber);

    // Prepare template data
    let templateData = {
      // Basic test information
      testName,
      testFilePath,
      fullTestName,
      testSuite,
      ancestorTitles: this.getAncestorTitles(test),
      duration: test.duration,

      // Git information
      commitHash: gitInfo.commit,
      commitMessage: gitInfo.message,
      commitAuthor: gitInfo.author,

      // Regression information
      regressionTime: new Date().toISOString(),

      // Error information
      errorMessage: errorInfo.message,
      stackTrace: errorInfo.stack,
      errorType: errorInfo.type,
      errorLocation: errorInfo.location,

      // Jest-specific information
      jestInfo,

      // Code information
      codeLanguage: this.getFileExtension(testFilePath),
      codeSnippet,

      // Analysis
      possibleCauses: this.analyzePossibleCauses(errorInfo.message, testFilePath)
    };

    // Process template data through hooks
    templateData = await this.hookManager.processReopenData(templateData as Record<string, any>, test, testFilePath) as typeof templateData;

    // Get the appropriate template using the factory
    const template = TemplateFactory.getTemplate(TemplateType.REOPEN_COMMENT, customTemplate, this.templates);

    // Generate and return the content
    return template.generate(test, testFilePath, templateData);
  }

  /**
   * Parse a full test name into test suite and test name
   *
   * @param fullTestName Full test name (e.g. "UserService › login › should authenticate valid users")
   * @returns Object containing testSuite and testName
   */
  private parseTestName(fullTestName: string): { testSuite: string, testName: string } {
    // Match everything up to the last ' › ' as group 1 (optional)
    // Match everything after the last ' › ' as group 2
    const regex = /^(?:(.*) › )?([^›]+)$/;
    const match = fullTestName.match(regex);

    if (!match) {
      return { testSuite: '', testName: fullTestName || '' };
    }

    return {
      testSuite: match[1] || '',  // Group 1 (everything before the last separator) or empty string
      testName: match[2].trim()   // Group 2 (everything after the last separator)
    };
  }

  /**
   * Extract error information from failure messages
   *
   * @param failureMessages Failure messages
   * @returns Error information
   */
  public extractErrorInfo(failureMessages: string[]): ErrorInfo {
    if (!failureMessages || failureMessages.length === 0) {
      return {
        message: 'No error message available',
        stack: '',
        type: 'Unknown',
        lineNumber: 0,
        location: 'Unknown'
      };
    }

    // Strip ANSI codes from the error message
    const rawErrorMessage = failureMessages[0];
    const errorMessage = this.stripAnsiCodes(rawErrorMessage);

    // Try to extract line number from stack trace
    const lineNumberMatch = errorMessage.match(/\(([^:]+):(\d+):(\d+)\)/);
    const lineNumber = lineNumberMatch ? parseInt(lineNumberMatch[2], 10) : 0;
    const filePath = lineNumberMatch ? lineNumberMatch[1] : null;

    // Use the ErrorUtils class to detect the error type
    const errorType = ErrorUtils.detectErrorType(errorMessage);

    // Split message and stack trace
    const parts = errorMessage.split('\n');
    const message = parts.slice(0, 5).join('\n'); // First few lines are usually the message
    const stack = parts.slice(5).join('\n');      // Rest is usually the stack trace

    // Format location
    let location = 'Unknown';
    if (filePath && lineNumber) {
      location = `${filePath}:${lineNumber}`;
    }

    return {
      message,
      stack,
      type: errorType,
      lineNumber,
      location
    };
  }

  /**
   * Get git information
   *
   * @returns Git information
   */
  public getGitInfo(): GitInfo {
    // Use the GitUtils class to get git information
    return GitUtils.getGitInfo();
  }

  /**
   * Strips ANSI escape codes from a string
   *
   * @param str The string to strip ANSI codes from
   * @returns The string without ANSI codes
   */
  private stripAnsiCodes(str: string | null | undefined): string {
    if (!str) return '';

    // Regular expression to match ANSI escape codes
    const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    return str.replace(ansiRegex, '');
  }

  /**
   * Gets environment information
   *
   * @returns Environment information
   */
  public getEnvironmentInfo(): Record<string, any> {
    return {
      nodeVersion: process.version,
      os: `${os.platform()} ${os.release()}`,
      isCI: !!process.env.CI
    };
  }

  /**
   * Extracts a code snippet from a file
   *
   * @param filePath The file path
   * @param lineNumber The line number
   * @returns The code snippet
   */
  private extractCodeSnippet(filePath: string, lineNumber: number): string {
    try {
      if (!lineNumber) {
        // If no line number, return a small portion of the file
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        return lines.slice(0, Math.min(20, lines.length)).join('\n');
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Get 5 lines before and after the error line
      const startLine = Math.max(0, lineNumber - 6);
      const endLine = Math.min(lines.length - 1, lineNumber + 5);

      return lines.slice(startLine, endLine + 1)
        .map((line, index) => {
          const currentLineNumber = startLine + index + 1;
          const marker = currentLineNumber === lineNumber ? '> ' : '  ';
          return `${marker}${currentLineNumber}: ${line}`;
        })
        .join('\n');
    } catch (error) {
      return 'Could not extract code snippet';
    }
  }

  /**
   * Gets the file extension
   *
   * @param filePath The file path
   * @returns The file extension
   */
  private getFileExtension(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.js':
        return 'javascript';
      case '.ts':
        return 'typescript';
      case '.jsx':
        return 'jsx';
      case '.tsx':
        return 'tsx';
      default:
        return '';
    }
  }

  /**
   * Formats a duration in milliseconds to a human-readable string
   *
   * @param ms The duration in milliseconds
   * @returns The formatted duration
   */
  public formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'}`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    } else {
      return `${seconds} second${seconds === 1 ? '' : 's'}`;
    }
  }

  /**
   * Analyzes possible causes of a test failure
   *
   * @param errorMessage The error message
   * @param testFilePath The test file path
   * @returns Possible causes
   */
  private analyzePossibleCauses(errorMessage: string, testFilePath: string): string[] {
    const causes: string[] = [];

    // Check for common error patterns
    if (errorMessage.includes('Cannot find module')) {
      causes.push('Missing dependency or incorrect import path');
    }

    if (errorMessage.includes('is not a function')) {
      causes.push('Method name typo or undefined method');
    }

    if (errorMessage.includes('Cannot read property') || errorMessage.includes('undefined is not an object')) {
      causes.push('Accessing property on undefined or null object');
    }

    if (errorMessage.includes('expect(')) {
      causes.push('Assertion failure - expected value does not match actual value');
    }

    if (errorMessage.toLowerCase().includes('timeout')) {
      causes.push('Test timeout - async operation took too long');
    }

    // Add a generic cause about the test file
    causes.push(`Check the test file ${testFilePath} for recent changes`);

    return this.getDefaultCauses(causes);
  }

  /**
   * Extract Jest-specific information from a test result
   *
   * @param test Test result
   * @returns Jest-specific information
   */
  private extractJestInfo(test: TestResult): Record<string, any> {
    return {
      title: test.title,
      status: test.status,
      numPassingAsserts: this.getNumPassingAsserts(test)
    };
  }

  /**
   * Get ancestor titles with fallback
   *
   * @param test Test result
   * @returns Ancestor titles array
   */
  private getAncestorTitles(test: TestResult): string[] {
    return test.ancestorTitles || [];
  }

  /**
   * Get number of passing asserts with fallback
   *
   * @param test Test result
   * @returns Number of passing asserts
   */
  private getNumPassingAsserts(test: TestResult): number {
    return test.numPassingAsserts || 0;
  }

  /**
   * Get default causes if none are identified
   *
   * @param causes Array of causes
   * @returns Causes with default if empty
   */
  private getDefaultCauses(causes: string[]): string[] {
    return causes.length > 0 ? causes : ['No specific cause identified'];
  }
}
