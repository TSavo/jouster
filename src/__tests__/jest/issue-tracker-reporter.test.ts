// @ts-nocheck
import { jest } from '@jest/globals';
import { IssueTrackerReporter } from '../../jest/issue-tracker-reporter';
import { IIssueManager } from '../../issues/issue-manager.interface';
import { PluginManager } from '../../plugins/plugin-manager';
import { IBugTracker } from '../../trackers/bug-tracker.interface';
import { mockTestFileResults, mockTestResults } from '../mocks/test-results.mock';

describe('IssueTrackerReporter', () => {
  let reporter: IssueTrackerReporter;
  let mockIssueManager: IIssueManager;
  let mockPluginManager: PluginManager;
  let mockBugTracker: IBugTracker;
  let globalConfig: any;
  let options: any;

  beforeEach(() => {
    // Create mock dependencies
    mockIssueManager = {
      processTestResults: jest.fn(),
      processTestFile: jest.fn(),
      handleFailedTest: jest.fn(),
      handlePassedTest: jest.fn()
    };

    mockPluginManager = new PluginManager();

    mockBugTracker = {
      initialize: jest.fn().mockResolvedValue(undefined),
      bugExists: jest.fn().mockResolvedValue(false),
      getBug: jest.fn().mockResolvedValue(null),
      createBug: jest.fn().mockResolvedValue({
        id: '123',
        status: 'open',
        testIdentifier: 'test-identifier',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail',
        lastFailure: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      }),
      closeBug: jest.fn().mockResolvedValue({
        id: '123',
        status: 'closed',
        testIdentifier: 'test-identifier',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should pass',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: new Date().toISOString(),
        fixedBy: 'Test Author',
        fixCommit: '1234567890abcdef',
        fixMessage: 'Fix test'
      }),
      reopenBug: jest.fn().mockResolvedValue({
        id: '123',
        status: 'open',
        testIdentifier: 'test-identifier',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail',
        lastFailure: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      }),
      updateBug: jest.fn().mockResolvedValue({
        id: '123',
        status: 'open',
        testIdentifier: 'test-identifier',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail',
        lastFailure: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      }),
      getAllBugs: jest.fn().mockResolvedValue({})
    };

    globalConfig = {};
    options = {
      generateIssues: true,
      trackIssues: true
    };

    reporter = new IssueTrackerReporter(
      globalConfig,
      options,
      mockIssueManager,
      mockPluginManager,
      mockBugTracker
    );

    // Spy on console methods
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('onRunStart', () => {
    it('should initialize the bug tracker', async () => {
      await reporter.onRunStart();
      expect(mockBugTracker.initialize).toHaveBeenCalled();
    });

    it('should handle bug tracker initialization error', async () => {
      mockBugTracker.initialize.mockRejectedValue(new Error('Initialization error'));
      await reporter.onRunStart();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Initialization error'));
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Bug tracker is not available'));
    });

    it('should not warn if bug tracker is available', async () => {
      await reporter.onRunStart();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should work without a bug tracker', async () => {
      // Create a reporter without a bug tracker
      const reporterWithoutTracker = new IssueTrackerReporter(
        globalConfig,
        options,
        mockIssueManager,
        mockPluginManager
      );

      // This should not throw an error
      await reporterWithoutTracker.onRunStart();

      // Since there's no bug tracker, it should warn
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Bug tracker is not available'));
    });
  });

  describe('onTestResult', () => {
    it('should add the test result to pending results', async () => {
      const test = { path: '/path/to/test.ts' };
      const testResult = mockTestFileResults;

      // Initialize the bug tracker
      await reporter.onRunStart();

      reporter.onTestResult(test, testResult);

      // We can't directly test the private pendingResults property,
      // but we can test that the onRunComplete method processes the results
      await reporter.onRunComplete();

      expect(mockIssueManager.processTestFile).toHaveBeenCalledWith(
        test.path,
        testResult,
        options
      );
    });
  });

  describe('onRunComplete', () => {
    it('should process pending results if tracker is available', async () => {
      const test = { path: '/path/to/test.ts' };
      const testResult = mockTestFileResults;

      // Initialize the bug tracker
      await reporter.onRunStart();

      reporter.onTestResult(test, testResult);

      await reporter.onRunComplete();

      expect(mockIssueManager.processTestFile).toHaveBeenCalledWith(
        test.path,
        testResult,
        options
      );
    });

    it('should not process results if tracker is not available', async () => {
      const test = { path: '/path/to/test.ts' };
      const testResult = mockTestFileResults;

      // Make the bug tracker initialization fail
      mockBugTracker.initialize.mockRejectedValue(new Error('Initialization error'));
      await reporter.onRunStart();

      reporter.onTestResult(test, testResult);

      await reporter.onRunComplete();

      expect(mockIssueManager.processTestFile).not.toHaveBeenCalled();
    });

    it('should not process results if generateIssues and trackIssues are false', async () => {
      const test = { path: '/path/to/test.ts' };
      const testResult = mockTestFileResults;

      // Initialize the bug tracker
      await reporter.onRunStart();

      reporter = new IssueTrackerReporter(
        globalConfig,
        {
          generateIssues: false,
          trackIssues: false
        },
        mockIssueManager,
        mockPluginManager,
        mockBugTracker
      );

      reporter.onTestResult(test, testResult);

      await reporter.onRunComplete();

      expect(mockIssueManager.processTestFile).not.toHaveBeenCalled();
    });

    it('should handle errors when processing results', async () => {
      const test = { path: '/path/to/test.ts' };
      const testResult = mockTestFileResults;

      // Initialize the bug tracker
      await reporter.onRunStart();

      mockIssueManager.processTestFile.mockRejectedValue(new Error('Failed to process test file'));

      reporter.onTestResult(test, testResult);

      // This should not throw an error
      await reporter.onRunComplete();

      expect(mockIssueManager.processTestFile).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should work with multiple test results', async () => {
      const test1 = { path: '/path/to/test1.ts' };
      const test2 = { path: '/path/to/test2.ts' };
      const testResult1 = mockTestFileResults;
      const testResult2 = { ...mockTestFileResults, testFilePath: '/path/to/test2.ts' };

      // Initialize the bug tracker
      await reporter.onRunStart();

      reporter.onTestResult(test1, testResult1);
      reporter.onTestResult(test2, testResult2);

      await reporter.onRunComplete();

      expect(mockIssueManager.processTestFile).toHaveBeenCalledWith(
        test1.path,
        testResult1,
        options
      );
      expect(mockIssueManager.processTestFile).toHaveBeenCalledWith(
        test2.path,
        testResult2,
        options
      );
    });

    it('should work without a bug tracker', async () => {
      const test = { path: '/path/to/test.ts' };
      const testResult = mockTestFileResults;

      // Create a reporter without a bug tracker
      const reporterWithoutTracker = new IssueTrackerReporter(
        globalConfig,
        options,
        mockIssueManager,
        mockPluginManager
      );

      // Initialize the reporter
      await reporterWithoutTracker.onRunStart();

      reporterWithoutTracker.onTestResult(test, testResult);

      // This should not throw an error
      await reporterWithoutTracker.onRunComplete();

      // Since there's no bug tracker, it should not process results
      expect(mockIssueManager.processTestFile).not.toHaveBeenCalled();
    });
  });

  describe('checkAndWarnAboutTracker', () => {
    it('should warn if tracker is not available and generateIssues or trackIssues is true', async () => {
      // Set isTrackerAvailable to false
      Object.defineProperty(reporter, 'isTrackerAvailable', {
        value: false,
        writable: true
      });

      // Call the private method directly
      reporter['checkAndWarnAboutTracker']();

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Bug tracker is not available'));
    });

    it('should not warn if tracker is available', async () => {
      // Set isTrackerAvailable to true
      Object.defineProperty(reporter, 'isTrackerAvailable', {
        value: true,
        writable: true
      });

      // Call the private method directly
      reporter['checkAndWarnAboutTracker']();

      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should not warn if generateIssues and trackIssues are false', async () => {
      // Set isTrackerAvailable to false
      Object.defineProperty(reporter, 'isTrackerAvailable', {
        value: false,
        writable: true
      });

      reporter = new IssueTrackerReporter(
        globalConfig,
        {
          generateIssues: false,
          trackIssues: false
        },
        mockIssueManager,
        mockPluginManager,
        mockBugTracker
      );

      // Call the private method directly
      reporter['checkAndWarnAboutTracker']();

      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  // Add an afterEach to restore all mocks
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('shouldProcessResults', () => {
    it('should return true when tracker is available and generateIssues is true', () => {
      reporter = new IssueTrackerReporter(
        globalConfig,
        { generateIssues: true, trackIssues: false },
        mockIssueManager,
        mockPluginManager,
        mockBugTracker
      );

      // Set tracker as available
      // @ts-ignore - Accessing private property for testing
      reporter.isTrackerAvailable = true;

      // @ts-ignore - Accessing private method for testing
      const result = reporter.shouldProcessResults();

      expect(result).toBe(true);
    });

    it('should return true when tracker is available and trackIssues is true', () => {
      reporter = new IssueTrackerReporter(
        globalConfig,
        { generateIssues: false, trackIssues: true },
        mockIssueManager,
        mockPluginManager,
        mockBugTracker
      );

      // Set tracker as available
      // @ts-ignore - Accessing private property for testing
      reporter.isTrackerAvailable = true;

      // @ts-ignore - Accessing private method for testing
      const result = reporter.shouldProcessResults();

      expect(result).toBe(true);
    });

    it('should return false when tracker is not available', () => {
      reporter = new IssueTrackerReporter(
        globalConfig,
        { generateIssues: true, trackIssues: true },
        mockIssueManager,
        mockPluginManager,
        mockBugTracker
      );

      // Set tracker as unavailable
      // @ts-ignore - Accessing private property for testing
      reporter.isTrackerAvailable = false;

      // @ts-ignore - Accessing private method for testing
      const result = reporter.shouldProcessResults();

      expect(result).toBe(false);
    });

    it('should return false when both generateIssues and trackIssues are false', () => {
      reporter = new IssueTrackerReporter(
        globalConfig,
        { generateIssues: false, trackIssues: false },
        mockIssueManager,
        mockPluginManager,
        mockBugTracker
      );

      // Set tracker as available
      // @ts-ignore - Accessing private property for testing
      reporter.isTrackerAvailable = true;

      // @ts-ignore - Accessing private method for testing
      const result = reporter.shouldProcessResults();

      expect(result).toBe(false);
    });
  });

  describe('handleProcessingError', () => {
    it('should log the error message', () => {
      // Mock console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('Processing error');

      // @ts-ignore - Accessing private method for testing
      reporter.handleProcessingError(error);

      expect(console.error).toHaveBeenCalledWith('Error processing test results: Processing error');
    });
  });

  describe('initializeOptions', () => {
    it('should return the options object if provided', () => {
      const options = { generateIssues: true, trackIssues: true };

      // @ts-ignore - Accessing private method for testing
      const result = reporter.initializeOptions(options);

      expect(result).toBe(options);
    });

    it('should return an empty object if options is undefined', () => {
      // @ts-ignore - Accessing private method for testing
      const result = reporter.initializeOptions(undefined);

      expect(result).toEqual({});
    });

    it('should return an empty object if options is null', () => {
      // @ts-ignore - Accessing private method for testing
      const result = reporter.initializeOptions(null);

      expect(result).toEqual({});
    });
  });

  describe('formatError', () => {
    it('should format Error objects', () => {
      const error = new Error('Test error');

      // @ts-ignore - Accessing private method for testing
      const result = reporter.formatError(error);

      expect(result).toBe('Test error');
    });

    it('should format non-Error objects', () => {
      const error = 'String error';

      // @ts-ignore - Accessing private method for testing
      const result = reporter.formatError(error);

      expect(result).toBe('String error');
    });

    it('should handle null and undefined', () => {
      // @ts-ignore - Accessing private method for testing
      const result1 = reporter.formatError(null);
      // @ts-ignore - Accessing private method for testing
      const result2 = reporter.formatError(undefined);

      expect(result1).toBe('null');
      expect(result2).toBe('undefined');
    });
  });

  describe('initializeBugTracker', () => {
    it('should initialize the bug tracker if provided', async () => {
      // @ts-ignore - Accessing private method for testing
      await reporter.initializeBugTracker();

      expect(mockBugTracker.initialize).toHaveBeenCalled();
      // @ts-ignore - Accessing private property for testing
      expect(reporter.isTrackerAvailable).toBe(true);
    });

    it('should do nothing if bug tracker is not provided', async () => {
      // Create a reporter without a bug tracker
      const reporterWithoutTracker = new IssueTrackerReporter(
        globalConfig,
        options,
        mockIssueManager,
        mockPluginManager
      );

      // @ts-ignore - Accessing private method for testing
      await reporterWithoutTracker.initializeBugTracker();

      // Should not throw an error
      // @ts-ignore - Accessing private property for testing
      expect(reporterWithoutTracker.isTrackerAvailable).toBe(false);
    });
  });

  describe('handleInitializationError', () => {
    it('should set isTrackerAvailable to false and log the error', () => {
      // Mock console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('Initialization error');

      // @ts-ignore - Accessing private method for testing
      reporter.handleInitializationError(error);

      // @ts-ignore - Accessing private property for testing
      expect(reporter.isTrackerAvailable).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error initializing bug tracker: Initialization error');
    });
  });

  describe('processTestResults', () => {
    it('should not process results if shouldProcessResults returns false', async () => {
      // Mock shouldProcessResults to return false
      // @ts-ignore - Accessing private method for testing
      const originalMethod = reporter.shouldProcessResults;
      // @ts-ignore - Mocking private method
      reporter.shouldProcessResults = jest.fn().mockReturnValue(false);

      // Add a test result
      const test = { path: '/path/to/test.ts' };
      const testResult = mockTestFileResults;
      reporter.onTestResult(test, testResult);

      // @ts-ignore - Accessing private method for testing
      await reporter.processTestResults();

      expect(mockIssueManager.processTestFile).not.toHaveBeenCalled();

      // Restore the original method
      // @ts-ignore - Restoring private method
      reporter.shouldProcessResults = originalMethod;
    });

    it('should process all pending results if shouldProcessResults returns true', async () => {
      // Mock shouldProcessResults to return true
      // @ts-ignore - Accessing private method for testing
      const originalMethod = reporter.shouldProcessResults;
      // @ts-ignore - Mocking private method
      reporter.shouldProcessResults = jest.fn().mockReturnValue(true);

      // Add test results
      const test1 = { path: '/path/to/test1.ts' };
      const test2 = { path: '/path/to/test2.ts' };
      const testResult1 = mockTestFileResults;
      const testResult2 = { ...mockTestFileResults, testFilePath: '/path/to/test2.ts' };

      reporter.onTestResult(test1, testResult1);
      reporter.onTestResult(test2, testResult2);

      // @ts-ignore - Accessing private method for testing
      await reporter.processTestResults();

      expect(mockIssueManager.processTestFile).toHaveBeenCalledWith(
        test1.path,
        testResult1,
        options
      );
      expect(mockIssueManager.processTestFile).toHaveBeenCalledWith(
        test2.path,
        testResult2,
        options
      );

      // Restore the original method
      // @ts-ignore - Restoring private method
      reporter.shouldProcessResults = originalMethod;
    });
  });

  describe('processTestResult', () => {
    it('should call issueManager.processTestFile with the correct parameters', async () => {
      const test = { path: '/path/to/test.ts' };
      const testResult = mockTestFileResults;

      // @ts-ignore - Accessing private method for testing
      await reporter.processTestResult(test, testResult);

      expect(mockIssueManager.processTestFile).toHaveBeenCalledWith(
        test.path,
        testResult,
        options
      );
    });
  });
});
