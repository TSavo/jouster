"use strict";

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { execSync } = require('child_process');
const os = require('os');

/**
 * Manager for handling templates
 */
class TemplateManager {
  /**
   * Creates a new TemplateManager instance
   */
  constructor() {
    this.templates = {};
    this.loadTemplates();
  }

  /**
   * Loads all templates
   */
  loadTemplates() {
    const templatesDir = path.join(__dirname);

    // Load issue template
    this.templates.issue = Handlebars.compile(
      fs.readFileSync(path.join(templatesDir, 'issue-template.hbs'), 'utf8')
    );

    // Load close comment template
    this.templates.closeComment = Handlebars.compile(
      fs.readFileSync(path.join(templatesDir, 'close-comment-template.hbs'), 'utf8')
    );

    // Load reopen comment template
    this.templates.reopenComment = Handlebars.compile(
      fs.readFileSync(path.join(templatesDir, 'reopen-comment-template.hbs'), 'utf8')
    );

    // Register helpers
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('dateFormat', function(date) {
      if (!date) return '';
      return new Date(date).toLocaleString();
    });
  }

  /**
   * Generates an issue body from a test result
   *
   * @param {Object} testResult The test result
   * @param {string} testFilePath The test file path
   * @returns {string} The issue body
   */
  generateIssueBody(testResult, testFilePath) {
    // Extract test suite name and test name
    const fullTestName = testResult.fullName;
    const testNameParts = fullTestName.split(' › ');
    const testSuite = testNameParts.length > 1 ? testNameParts.slice(0, -1).join(' › ') : '';
    const testName = testNameParts[testNameParts.length - 1];

    // Get git information
    const gitInfo = this.getGitInfo();

    // Get environment information
    const envInfo = this.getEnvironmentInfo();

    // Extract error information
    const errorInfo = this.extractErrorInfo(testResult.failureMessages);

    // Extract Jest-specific information
    const jestInfo = this.extractJestInfo(testResult);

    // Get code snippet
    const codeSnippet = this.extractCodeSnippet(testFilePath, errorInfo.lineNumber);

    // Prepare template data
    const templateData = {
      // Basic test information
      testName,
      testFilePath,
      fullTestName,
      testSuite,
      ancestorTitles: testResult.ancestorTitles || [],
      duration: testResult.duration,
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
      numPassingAsserts: testResult.numPassingAsserts || 0,
      invocations: testResult.invocations || 1,
      status: testResult.status,
      retryReasons: testResult.retryReasons || [],
      failureDetails: testResult.failureDetails || [],

      // Code information
      codeLanguage: this.getFileExtension(testFilePath),
      codeSnippet,

      // History information
      previousOccurrences: 0, // This would be populated from mapping data
      lastFixedDate: null, // This would be populated from mapping data

      // Analysis
      possibleCauses: this.analyzePossibleCauses(errorInfo.message, testFilePath)
    };

    // Generate the issue body
    return this.templates.issue(templateData);
  }

  /**
   * Extracts Jest-specific information from a test result
   *
   * @param {Object} testResult The test result
   * @returns {Object} Jest-specific information
   */
  extractJestInfo(testResult) {
    // Extract matcher information if available
    let matcherInfo = null;
    if (testResult.failureDetails && testResult.failureDetails.length > 0) {
      const detail = testResult.failureDetails[0];
      if (detail.matcherResult) {
        // Strip ANSI codes from matcher result values
        const actual = typeof detail.matcherResult.actual === 'string'
          ? this.stripAnsiCodes(detail.matcherResult.actual)
          : detail.matcherResult.actual;

        const expected = typeof detail.matcherResult.expected === 'string'
          ? this.stripAnsiCodes(detail.matcherResult.expected)
          : detail.matcherResult.expected;

        matcherInfo = {
          name: detail.matcherResult.name,
          actual: actual,
          expected: expected,
          pass: detail.matcherResult.pass
        };
      }
    }

    return {
      matcherInfo,
      testPath: testResult.testPath,
      testContext: testResult.testContext,
      title: testResult.title,
      displayName: testResult.displayName
    };
  }

  /**
   * Generates a close comment
   *
   * @param {Object} testResult The test result
   * @param {string} testFilePath The test file path
   * @param {Object} mapping The mapping data
   * @returns {string} The close comment
   */
  generateCloseComment(testResult, testFilePath, mapping) {
    // Extract test suite name and test name
    const fullTestName = testResult.fullName;
    const testNameParts = fullTestName.split(' › ');
    const testSuite = testNameParts.length > 1 ? testNameParts.slice(0, -1).join(' › ') : '';
    const testName = testNameParts[testNameParts.length - 1];

    // Get git information
    const gitInfo = this.getGitInfo();

    // Get environment information
    const envInfo = this.getEnvironmentInfo();

    // Calculate failure duration
    const failureTime = mapping ? new Date(mapping.lastFailure) : new Date();
    const fixedTime = new Date();
    const failureDuration = this.formatDuration(fixedTime - failureTime);

    // Prepare template data
    const templateData = {
      // Basic test information
      testName,
      testFilePath,
      fullTestName,
      testSuite,
      ancestorTitles: testResult.ancestorTitles || [],
      duration: testResult.duration,

      // Git information
      commitHash: gitInfo.commit,
      commitMessage: gitInfo.message,
      commitAuthor: gitInfo.author,
      branchName: gitInfo.branch,

      // Environment information
      nodeVersion: process.version,
      osInfo: `${os.platform()} ${os.release()}`,

      // Resolution information
      fixedTime: fixedTime.toISOString(),
      failureDuration,

      // Jest-specific information
      status: testResult.status,
      invocations: testResult.invocations || 1,
      numPassingAsserts: testResult.numPassingAsserts || 0,

      // Additional information
      fixNotes: '' // This could be populated from commit messages or PR descriptions
    };

    // Generate the close comment
    return this.templates.closeComment(templateData);
  }

  /**
   * Generates a reopen comment
   *
   * @param {Object} testResult The test result
   * @param {string} testFilePath The test file path
   * @param {Object} mapping The mapping data
   * @returns {string} The reopen comment
   */
  generateReopenComment(testResult, testFilePath, mapping) {
    // Extract test suite name and test name
    const fullTestName = testResult.fullName;
    const testNameParts = fullTestName.split(' › ');
    const testSuite = testNameParts.length > 1 ? testNameParts.slice(0, -1).join(' › ') : '';
    const testName = testNameParts[testNameParts.length - 1];

    // Get git information
    const gitInfo = this.getGitInfo();

    // Extract error information
    const errorInfo = this.extractErrorInfo(testResult.failureMessages);

    // Extract Jest-specific information
    const jestInfo = this.extractJestInfo(testResult);

    // Calculate passing duration
    const lastUpdate = mapping ? new Date(mapping.lastUpdate) : new Date();
    const regressionTime = new Date();
    const passingDuration = this.formatDuration(regressionTime - lastUpdate);

    // Get diff summary if possible
    const diffSummary = this.getDiffSummary(testFilePath, mapping);

    // Get code snippet
    const codeSnippet = this.extractCodeSnippet(testFilePath, errorInfo.lineNumber);

    // Extract previous fix information from mapping
    const fixInfo = {
      lastUpdate: mapping ? mapping.lastUpdate : null,
      fixedBy: mapping ? (mapping.fixedBy || 'Unknown') : 'Unknown',
      fixCommit: mapping ? (mapping.fixCommit || 'Unknown') : 'Unknown'
    };

    // Prepare template data
    const templateData = {
      // Basic test information
      testName,
      testFilePath,
      fullTestName,
      testSuite,
      ancestorTitles: testResult.ancestorTitles || [],
      duration: testResult.duration,

      // Git information
      commitHash: gitInfo.commit,
      commitMessage: gitInfo.message,
      commitAuthor: gitInfo.author,

      // Regression information
      regressionTime: regressionTime.toISOString(),
      passingDuration,
      mapping: fixInfo,  // Include mapping information for the template

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
      diffSummary,
      possibleCauses: this.analyzePossibleCauses(errorInfo.message, testFilePath)
    };

    // Generate the reopen comment
    return this.templates.reopenComment(templateData);
  }

  /**
   * Gets git information
   *
   * @returns {Object} Git information
   */
  getGitInfo() {
    // Default values in case git commands fail
    const defaultInfo = {
      branch: 'unknown',
      commit: 'unknown',
      message: 'unknown',
      author: 'unknown'
    };

    try {
      // Check if git is available
      try {
        execSync('git --version').toString().trim();
      } catch (e) {
        console.log('[Template Manager] Git not available:', e.message);
        return defaultInfo;
      }

      // Use simpler git commands that work on all platforms
      let branch = 'unknown';
      let commit = 'unknown';
      let message = 'unknown';
      let author = 'unknown';

      // Use try/catch for each command to handle errors gracefully
      try {
        // Different syntax for Windows vs Unix
        if (process.platform === 'win32') {
          branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        } else {
          branch = execSync('git branch --show-current').toString().trim();
        }
      } catch (e) {
        console.log('[Template Manager] Error getting branch:', e.message);
      }

      try {
        commit = execSync('git rev-parse HEAD').toString().trim();
      } catch (e) {
        console.log('[Template Manager] Error getting commit hash:', e.message);
      }

      try {
        // Use a simpler format string that works on Windows
        message = execSync('git log -1 --pretty="%s"').toString().trim();
      } catch (e) {
        console.log('[Template Manager] Error getting commit message:', e.message);
      }

      try {
        // Use a simpler format string that works on Windows
        author = execSync('git log -1 --pretty="%an"').toString().trim();
      } catch (e) {
        console.log('[Template Manager] Error getting author:', e.message);
      }

      return { branch, commit, message, author };
    } catch (error) {
      console.error('[Template Manager] Error getting git info:', error.message);
      return defaultInfo;
    }
  }

  /**
   * Gets environment information
   *
   * @returns {Object} Environment information
   */
  getEnvironmentInfo() {
    return {
      nodeVersion: process.version,
      os: `${os.platform()} ${os.release()}`,
      isCI: !!process.env.CI
    };
  }

  /**
   * Strips ANSI escape codes from a string
   *
   * @param {string} str The string to strip ANSI codes from
   * @returns {string} The string without ANSI codes
   */
  stripAnsiCodes(str) {
    // Regular expression to match ANSI escape codes
    const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    return str ? str.replace(ansiRegex, '') : str;
  }

  /**
   * Extracts error information from failure messages
   *
   * @param {string[]} failureMessages The failure messages
   * @returns {Object} Error information
   */
  extractErrorInfo(failureMessages) {
    if (!failureMessages || failureMessages.length === 0) {
      return {
        message: 'No error message available',
        stack: '',
        lineNumber: null,
        type: 'Unknown',
        location: 'Unknown'
      };
    }

    // Strip ANSI codes from the error message
    const rawErrorMessage = failureMessages[0];
    const errorMessage = this.stripAnsiCodes(rawErrorMessage);

    // Try to extract line number from stack trace
    const lineNumberMatch = errorMessage.match(/\(([^:]+):(\d+):(\d+)\)/);
    const lineNumber = lineNumberMatch ? parseInt(lineNumberMatch[2], 10) : null;
    const columnNumber = lineNumberMatch ? parseInt(lineNumberMatch[3], 10) : null;
    const filePath = lineNumberMatch ? lineNumberMatch[1] : null;

    // Try to extract error type
    let errorType = 'Unknown';
    const errorTypeMatch = errorMessage.match(/Error: (.+?)\n/);
    if (errorTypeMatch) {
      errorType = errorTypeMatch[1].trim();
    } else if (errorMessage.includes('expect(')) {
      errorType = 'Assertion Error';
    } else if (errorMessage.includes('TypeError:')) {
      errorType = 'Type Error';
    } else if (errorMessage.includes('ReferenceError:')) {
      errorType = 'Reference Error';
    }

    // Split message and stack trace
    const parts = errorMessage.split('\n');
    const message = parts.slice(0, 5).join('\n'); // First few lines are usually the message
    const stack = parts.slice(5).join('\n');      // Rest is usually the stack trace

    // Format location
    let location = 'Unknown';
    if (filePath && lineNumber) {
      location = `${filePath}:${lineNumber}`;
      if (columnNumber) {
        location += `:${columnNumber}`;
      }
    }

    // Extract expected vs actual values
    let expected = null;
    let actual = null;
    const expectedMatch = message.match(/Expected:?\s+(.+?)\n/);
    const actualMatch = message.match(/Received:?\s+(.+?)\n/);
    if (expectedMatch) expected = this.stripAnsiCodes(expectedMatch[1].trim());
    if (actualMatch) actual = this.stripAnsiCodes(actualMatch[1].trim());

    return {
      message,
      stack,
      lineNumber,
      columnNumber,
      filePath,
      type: errorType,
      location,
      expected,
      actual
    };
  }

  /**
   * Extracts a code snippet from a file
   *
   * @param {string} filePath The file path
   * @param {number} lineNumber The line number
   * @returns {string} The code snippet
   */
  extractCodeSnippet(filePath, lineNumber) {
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
      console.error('[Template Manager] Error extracting code snippet:', error.message);
      return 'Could not extract code snippet';
    }
  }

  /**
   * Gets the file extension
   *
   * @param {string} filePath The file path
   * @returns {string} The file extension
   */
  getFileExtension(filePath) {
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
   * @param {number} ms The duration in milliseconds
   * @returns {string} The formatted duration
   */
  formatDuration(ms) {
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
   * Gets a diff summary for a file
   *
   * @param {string} filePath The file path
   * @param {Object} mapping The mapping data
   * @returns {string} The diff summary
   */
  getDiffSummary(filePath, mapping) {
    if (!mapping || !mapping.lastUpdate) {
      return '';
    }

    try {
      // Simplified approach that works on all platforms
      // Just return a message about the file being modified
      return `The test file ${filePath} has been modified since the last update.`;

      // Note: A more sophisticated approach would be to use simpler git commands
      // or a git library that works well cross-platform
    } catch (error) {
      console.error('[Template Manager] Error getting diff summary:', error.message);
      return '';
    }
  }

  /**
   * Analyzes possible causes of a test failure
   *
   * @param {string} errorMessage The error message
   * @param {string} testFilePath The test file path
   * @returns {string[]} Possible causes
   */
  analyzePossibleCauses(errorMessage, testFilePath) {
    const causes = [];

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

    if (errorMessage.includes('timeout')) {
      causes.push('Test timeout - async operation took too long');
    }

    // Add a generic cause about the test file
    causes.push(`Check the test file ${testFilePath} for recent changes`);

    // We're skipping the git command that was causing issues on Windows
    // A more robust implementation would use a cross-platform git library

    return causes.length > 0 ? causes : ['No specific cause identified'];
  }
}

module.exports = { TemplateManager };
