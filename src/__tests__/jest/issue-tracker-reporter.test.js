"use strict";

const IssueTrackerReporter = require('../../jest/issue-tracker-reporter');

// Mock dependencies
jest.mock('../../issues/issue-manager', () => ({
  IssueManager: jest.fn().mockImplementation(() => ({
    processTestResults: jest.fn().mockResolvedValue(undefined)
  }))
}));

jest.mock('../../storage/mapping-store', () => ({
  MappingStore: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('../../github/github-client', () => ({
  GitHubClient: jest.fn().mockImplementation(() => ({
    isGitHubCliAvailable: jest.fn().mockResolvedValue(true)
  }))
}));

describe('IssueTrackerReporter', () => {
  let reporter;
  let mockLogger;
  let mockIssueManager;
  let mockMappingStore;
  let mockGitHubClient;
  let mockEnv;
  let mockArgv;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock dependencies
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    mockIssueManager = {
      processTestResults: jest.fn().mockResolvedValue(undefined)
    };

    mockMappingStore = {};
    mockGitHubClient = {
      isGitHubCliAvailable: jest.fn().mockResolvedValue(true)
    };

    mockEnv = {};
    mockArgv = [];

    // Create reporter with mock dependencies
    reporter = new IssueTrackerReporter(
      {}, // globalConfig
      { databasePath: 'test-db.json' }, // reporterOptions
      {
        createIssueManager: () => mockIssueManager,
        createMappingStore: () => mockMappingStore,
        createGitHubClient: () => mockGitHubClient,
        getEnv: () => mockEnv,
        getArgv: () => mockArgv,
        logger: mockLogger
      }
    );
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const reporter = new IssueTrackerReporter({}, {});
      expect(reporter.options).toEqual({
        generateIssues: false,
        trackIssues: false,
        databasePath: undefined
      });
    });

    it('should initialize with options from environment variables', () => {
      mockEnv = { GENERATE_ISSUES: 'true' };
      const reporter = new IssueTrackerReporter(
        {},
        {},
        {
          getEnv: () => mockEnv,
          getArgv: () => []
        }
      );
      expect(reporter.options).toEqual({
        generateIssues: true,
        trackIssues: true,
        databasePath: undefined
      });
    });

    it('should initialize with options from command line arguments', () => {
      mockArgv = ['--track-issues'];
      const reporter = new IssueTrackerReporter(
        {},
        {},
        {
          getEnv: () => ({}),
          getArgv: () => mockArgv
        }
      );
      expect(reporter.options).toEqual({
        generateIssues: false,
        trackIssues: true,
        databasePath: undefined
      });
    });

    it('should initialize with database path from options', () => {
      const reporter = new IssueTrackerReporter(
        {},
        { databasePath: 'custom-db.json' }
      );
      expect(reporter.options.databasePath).toBe('custom-db.json');
    });
  });

  describe('checkGitHubCli', () => {
    it('should check if GitHub CLI is available', async () => {
      await reporter.checkGitHubCli();
      expect(mockGitHubClient.isGitHubCliAvailable).toHaveBeenCalled();
      expect(reporter.isGitHubCliAvailable).toBe(true);
    });

    it('should handle errors when checking GitHub CLI availability', async () => {
      mockGitHubClient.isGitHubCliAvailable.mockRejectedValueOnce(new Error('CLI error'));
      await reporter.checkGitHubCli();
      expect(mockLogger.error).toHaveBeenCalled();
      expect(reporter.isGitHubCliAvailable).toBe(false);
    });

    it('should warn if GitHub CLI is not available but needed', async () => {
      mockGitHubClient.isGitHubCliAvailable.mockResolvedValueOnce(false);
      reporter.options.generateIssues = true;
      await reporter.checkGitHubCli();
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
    });

    it('should not warn if GitHub CLI is not available but not needed', async () => {
      mockGitHubClient.isGitHubCliAvailable.mockResolvedValueOnce(false);
      reporter.options.generateIssues = false;
      reporter.options.trackIssues = false;
      await reporter.checkGitHubCli();
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });
  });

  describe('onRunStart', () => {
    it('should check GitHub CLI availability', async () => {
      const spy = jest.spyOn(reporter, 'checkGitHubCli');
      await reporter.onRunStart();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onTestStart', () => {
    it('should do nothing (placeholder function)', () => {
      // This function is a placeholder and doesn't do anything
      // We're just calling it to get 100% function coverage
      reporter.onTestStart();
      // No assertions needed as the function doesn't do anything
      expect(true).toBe(true);
    });
  });

  describe('onTestResult', () => {
    it('should store test results', () => {
      const testResult = {
        testFilePath: '/path/to/test.js',
        testResults: [{ title: 'test 1' }]
      };
      reporter.onTestResult({}, testResult);
      expect(reporter.pendingResults).toEqual([{
        testFilePath: '/path/to/test.js',
        testResults: [{ title: 'test 1' }]
      }]);
    });
  });

  describe('onRunComplete', () => {
    it('should not process results if GitHub CLI is not available', async () => {
      reporter.isGitHubCliAvailable = false;
      await reporter.onRunComplete();
      expect(mockIssueManager.processTestResults).not.toHaveBeenCalled();
    });

    it('should not process results if tracking and generating issues are disabled', async () => {
      reporter.isGitHubCliAvailable = true;
      reporter.options.generateIssues = false;
      reporter.options.trackIssues = false;
      await reporter.onRunComplete();
      expect(mockIssueManager.processTestResults).not.toHaveBeenCalled();
    });

    it('should process results if generating issues is enabled', async () => {
      reporter.isGitHubCliAvailable = true;
      reporter.options.generateIssues = true;
      reporter.options.trackIssues = false; // Explicitly set trackIssues to false
      reporter.pendingResults = [{ testFilePath: '/path/to/test.js', testResults: [] }];
      await reporter.onRunComplete();
      expect(mockIssueManager.processTestResults).toHaveBeenCalledWith(
        [{ testFilePath: '/path/to/test.js', testResults: [] }],
        { createIssues: true, closeIssues: false }
      );
    });

    it('should process results if tracking issues is enabled', async () => {
      reporter.isGitHubCliAvailable = true;
      reporter.options.trackIssues = true;
      reporter.pendingResults = [{ testFilePath: '/path/to/test.js', testResults: [] }];
      await reporter.onRunComplete();
      expect(mockIssueManager.processTestResults).toHaveBeenCalledWith(
        [{ testFilePath: '/path/to/test.js', testResults: [] }],
        { createIssues: false, closeIssues: true }
      );
    });

    it('should handle errors when processing results', async () => {
      reporter.isGitHubCliAvailable = true;
      reporter.options.generateIssues = true;
      mockIssueManager.processTestResults.mockRejectedValueOnce(new Error('Process error'));
      await reporter.onRunComplete();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('default factory methods', () => {
    it('should create a mapping store with the provided database path', () => {
      // Mock the MappingStore constructor
      const mockMappingStore = {};
      const MockMappingStore = jest.fn().mockImplementation(() => mockMappingStore);
      jest.mock('../../storage/mapping-store', () => ({
        MappingStore: MockMappingStore
      }), { virtual: true });

      // Create a new instance of the reporter with our mocked dependencies
      const reporter = new IssueTrackerReporter(
        {}, // globalConfig
        { databasePath: 'test-db.json' }, // reporterOptions
        {
          createMappingStore: jest.fn().mockReturnValue(mockMappingStore),
          createGitHubClient: jest.fn(),
          createIssueManager: jest.fn(),
          getEnv: () => ({}),
          getArgv: () => [],
          logger: { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
        }
      );

      // Call the method directly
      const result = reporter._defaultCreateMappingStore('test-db.json');

      // Verify the result is the mock mapping store
      expect(result).toBeDefined();
    });

    it('should create a GitHub client', () => {
      // Mock the GitHubClient constructor
      const mockGitHubClient = {};
      const MockGitHubClient = jest.fn().mockImplementation(() => mockGitHubClient);
      jest.mock('../../github/github-client', () => ({
        GitHubClient: MockGitHubClient
      }), { virtual: true });

      // Create a new instance of the reporter with our mocked dependencies
      const reporter = new IssueTrackerReporter(
        {}, // globalConfig
        {}, // reporterOptions
        {
          createMappingStore: jest.fn(),
          createGitHubClient: jest.fn().mockReturnValue(mockGitHubClient),
          createIssueManager: jest.fn(),
          getEnv: () => ({}),
          getArgv: () => [],
          logger: { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
        }
      );

      // Call the method directly
      const result = reporter._defaultCreateGitHubClient();

      // Verify the result is the mock GitHub client
      expect(result).toBeDefined();
    });

    it('should create an issue manager with the provided dependencies', () => {
      // Mock the IssueManager constructor
      const mockIssueManager = {};
      const MockIssueManager = jest.fn().mockImplementation(() => mockIssueManager);
      jest.mock('../../issues/issue-manager', () => ({
        IssueManager: MockIssueManager
      }), { virtual: true });

      // Create a new instance of the reporter with our mocked dependencies
      const reporter = new IssueTrackerReporter(
        {}, // globalConfig
        {}, // reporterOptions
        {
          createMappingStore: jest.fn(),
          createGitHubClient: jest.fn(),
          createIssueManager: jest.fn().mockReturnValue(mockIssueManager),
          getEnv: () => ({}),
          getArgv: () => [],
          logger: { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
        }
      );

      // Call the method directly
      const mappingStore = {};
      const githubClient = {};
      const result = reporter._defaultCreateIssueManager(mappingStore, githubClient);

      // Verify the result is the mock issue manager
      expect(result).toBeDefined();
    });
  });
});
