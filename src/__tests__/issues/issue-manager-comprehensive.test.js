"use strict";

const { IssueManager } = require('../../issues/issue-manager');

// Mock dependencies
const mockMappingStore = {
  getMapping: jest.fn(),
  setMapping: jest.fn(),
  updateMapping: jest.fn()
};

const mockGithubClient = {
  createIssue: jest.fn(),
  closeIssue: jest.fn(),
  reopenIssue: jest.fn(),
  checkIssueStatus: jest.fn()
};

const mockTemplateManager = {
  generateIssueBody: jest.fn().mockReturnValue('Issue body'),
  generateCloseComment: jest.fn().mockReturnValue('Close comment'),
  generateReopenComment: jest.fn().mockReturnValue('Reopen comment'),
  getGitInfo: jest.fn().mockReturnValue({
    author: 'Test Author',
    commit: '1234567890abcdef',
    message: 'Test commit message'
  })
};

// Mock test results
const mockFailingTest = {
  fullName: 'Test Suite › test should fail',
  status: 'failed',
  failureMessages: ['Error: test failed']
};

const mockPassingTest = {
  fullName: 'Test Suite › test should pass',
  status: 'passed'
};

const mockPendingTest = {
  fullName: 'Test Suite › test should be pending',
  status: 'pending'
};

// Mock current date
const mockCurrentDate = '2025-04-06T09:22:03.307Z';

describe('IssueManager', () => {
  let issueManager;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up default mock return values
    mockGithubClient.createIssue.mockResolvedValue({ success: true, issueNumber: 123 });
    mockGithubClient.closeIssue.mockResolvedValue({ success: true });
    mockGithubClient.reopenIssue.mockResolvedValue({ success: true });
    mockGithubClient.checkIssueStatus.mockResolvedValue({ success: true, status: 'open' });

    // Create a new instance of IssueManager for each test
    issueManager = new IssueManager({
      mappingStore: mockMappingStore,
      githubClient: mockGithubClient,
      templateManager: mockTemplateManager,
      getCurrentDate: () => mockCurrentDate,
      pathRelative: (from, to) => to // Simple mock that just returns the 'to' path
    });
  });

  describe('constructor', () => {
    it('should throw an error if required dependencies are missing', () => {
      expect(() => new IssueManager()).toThrow('Missing required dependencies');
      expect(() => new IssueManager({})).toThrow('Missing required dependencies');
      expect(() => new IssueManager({ mappingStore: {} })).toThrow('Missing required dependencies');
      expect(() => new IssueManager({ githubClient: {} })).toThrow('Missing required dependencies');
    });

    it('should create an instance with default dependencies if not provided', () => {
      const manager = new IssueManager({
        mappingStore: mockMappingStore,
        githubClient: mockGithubClient
      });

      expect(manager).toBeInstanceOf(IssueManager);
      expect(manager.mappingStore).toBe(mockMappingStore);
      expect(manager.githubClient).toBe(mockGithubClient);
      expect(manager.templateManager).toBeDefined();
      expect(manager.pathRelative).toBeDefined();
      expect(manager.getCurrentDate).toBeDefined();
      expect(manager.generateTestId).toBeDefined();
      expect(manager.getTestDesc).toBeDefined();
    });

    it('should use default implementations for optional dependencies', () => {
      const manager = new IssueManager({
        mappingStore: mockMappingStore,
        githubClient: mockGithubClient
      });

      // Call the default implementations to ensure they're covered
      const from = '/root/path';
      const to = '/root/path/to/test.js';
      const relativePath = manager.pathRelative(from, to);
      // On Windows, path.relative uses backslashes, on Unix it uses forward slashes
      expect(relativePath === 'to\\test.js' || relativePath === 'to/test.js').toBe(true);

      const currentDate = manager.getCurrentDate();
      expect(currentDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/); // ISO date format

      const testId = manager.generateTestId('path/to/test.js', 'Test Suite › test should fail');
      expect(testId).toBeDefined();

      const testDesc = manager.getTestDesc('Test Suite › test should fail');
      expect(testDesc).toBe('test should fail');
    });
  });

  describe('processTestResults', () => {
    it('should process each test file', async () => {
      // Spy on the processTestFile method
      const spy = jest.spyOn(issueManager, 'processTestFile');

      // Create test results
      const testResults = [
        { testFilePath: '/path/to/test1.js', testResults: [] },
        { testFilePath: '/path/to/test2.js', testResults: [] }
      ];

      // Call the method
      await issueManager.processTestResults(testResults);

      // Verify that processTestFile was called for each test file
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(testResults[0], { createIssues: true, closeIssues: true });
      expect(spy).toHaveBeenCalledWith(testResults[1], { createIssues: true, closeIssues: true });

      // Clean up
      spy.mockRestore();
    });

    it('should handle null or non-array test results', async () => {
      // Spy on the processTestFile method
      const spy = jest.spyOn(issueManager, 'processTestFile');

      // Call the method with null
      await issueManager.processTestResults(null);

      // Call the method with a non-array
      await issueManager.processTestResults({});

      // Verify that processTestFile was not called
      expect(spy).not.toHaveBeenCalled();

      // Clean up
      spy.mockRestore();
    });

    it('should use provided options', async () => {
      // Spy on the processTestFile method
      const spy = jest.spyOn(issueManager, 'processTestFile');

      // Create test results
      const testResults = [
        { testFilePath: '/path/to/test.js', testResults: [] }
      ];

      // Call the method with custom options
      await issueManager.processTestResults(testResults, { createIssues: false, closeIssues: false });

      // Verify that processTestFile was called with the custom options
      expect(spy).toHaveBeenCalledWith(testResults[0], { createIssues: false, closeIssues: false });

      // Clean up
      spy.mockRestore();
    });
  });

  describe('processTestFile', () => {
    it('should process each test result in a file', async () => {
      // Spy on the handleFailedTest and handlePassedTest methods
      const failedSpy = jest.spyOn(issueManager, 'handleFailedTest');
      const passedSpy = jest.spyOn(issueManager, 'handlePassedTest');

      // Create a test file with both failing and passing tests
      const testFile = {
        testFilePath: '/path/to/test.js',
        testResults: [
          mockFailingTest,
          mockPassingTest
        ]
      };

      // Call the method
      await issueManager.processTestFile(testFile, { createIssues: true, closeIssues: true });

      // Verify that handleFailedTest was called for the failing test
      expect(failedSpy).toHaveBeenCalledWith(
        expect.any(String), // testIdentifier
        '/path/to/test.js', // testFilePath
        mockFailingTest // test
      );

      // Verify that handlePassedTest was called for the passing test
      expect(passedSpy).toHaveBeenCalledWith(
        expect.any(String), // testIdentifier
        '/path/to/test.js', // testFilePath
        mockPassingTest // test
      );

      // Clean up
      failedSpy.mockRestore();
      passedSpy.mockRestore();
    });

    it('should skip processing if testFile is null or undefined', async () => {
      // Spy on the handleFailedTest and handlePassedTest methods
      const failedSpy = jest.spyOn(issueManager, 'handleFailedTest');
      const passedSpy = jest.spyOn(issueManager, 'handlePassedTest');

      // Call the method with null
      await issueManager.processTestFile(null, { createIssues: true, closeIssues: true });

      // Call the method with undefined
      await issueManager.processTestFile(undefined, { createIssues: true, closeIssues: true });

      // Verify that neither handleFailedTest nor handlePassedTest was called
      expect(failedSpy).not.toHaveBeenCalled();
      expect(passedSpy).not.toHaveBeenCalled();

      // Clean up
      failedSpy.mockRestore();
      passedSpy.mockRestore();
    });

    it('should skip processing if testFilePath is missing', async () => {
      // Spy on the handleFailedTest and handlePassedTest methods
      const failedSpy = jest.spyOn(issueManager, 'handleFailedTest');
      const passedSpy = jest.spyOn(issueManager, 'handlePassedTest');

      // Create a test file without a testFilePath
      const testFile = {
        testResults: [mockFailingTest, mockPassingTest]
      };

      // Call the method
      await issueManager.processTestFile(testFile, { createIssues: true, closeIssues: true });

      // Verify that neither handleFailedTest nor handlePassedTest was called
      expect(failedSpy).not.toHaveBeenCalled();
      expect(passedSpy).not.toHaveBeenCalled();

      // Clean up
      failedSpy.mockRestore();
      passedSpy.mockRestore();
    });

    it('should skip processing if testResults is empty', async () => {
      // Spy on the handleFailedTest and handlePassedTest methods
      const failedSpy = jest.spyOn(issueManager, 'handleFailedTest');
      const passedSpy = jest.spyOn(issueManager, 'handlePassedTest');

      // Create a test file with empty testResults
      const testFile = {
        testFilePath: '/path/to/test.js',
        testResults: []
      };

      // Call the method
      await issueManager.processTestFile(testFile, { createIssues: true, closeIssues: true });

      // Verify that neither handleFailedTest nor handlePassedTest was called
      expect(failedSpy).not.toHaveBeenCalled();
      expect(passedSpy).not.toHaveBeenCalled();

      // Clean up
      failedSpy.mockRestore();
      passedSpy.mockRestore();
    });

    it('should skip tests with missing fullName', async () => {
      // Spy on the handleFailedTest and handlePassedTest methods
      const failedSpy = jest.spyOn(issueManager, 'handleFailedTest');
      const passedSpy = jest.spyOn(issueManager, 'handlePassedTest');

      // Create a test file with a test missing fullName
      const testFile = {
        testFilePath: '/path/to/test.js',
        testResults: [
          { status: 'failed' } // Missing fullName
        ]
      };

      // Call the method
      await issueManager.processTestFile(testFile, { createIssues: true, closeIssues: true });

      // Verify that neither handleFailedTest nor handlePassedTest was called
      expect(failedSpy).not.toHaveBeenCalled();
      expect(passedSpy).not.toHaveBeenCalled();

      // Clean up
      failedSpy.mockRestore();
      passedSpy.mockRestore();
    });

    it('should respect createIssues option', async () => {
      // Spy on the handleFailedTest method
      const failedSpy = jest.spyOn(issueManager, 'handleFailedTest');

      // Create a test file with a failing test
      const testFile = {
        testFilePath: '/path/to/test.js',
        testResults: [mockFailingTest]
      };

      // Call the method with createIssues set to false
      await issueManager.processTestFile(testFile, { createIssues: false, closeIssues: true });

      // Verify that handleFailedTest was not called
      expect(failedSpy).not.toHaveBeenCalled();

      // Clean up
      failedSpy.mockRestore();
    });

    it('should respect closeIssues option', async () => {
      // Spy on the handlePassedTest method
      const passedSpy = jest.spyOn(issueManager, 'handlePassedTest');

      // Create a test file with a passing test
      const testFile = {
        testFilePath: '/path/to/test.js',
        testResults: [mockPassingTest]
      };

      // Call the method with closeIssues set to false
      await issueManager.processTestFile(testFile, { createIssues: true, closeIssues: false });

      // Verify that handlePassedTest was not called
      expect(passedSpy).not.toHaveBeenCalled();

      // Clean up
      passedSpy.mockRestore();
    });

    it('should ignore tests with status other than passed or failed', async () => {
      // Spy on the handleFailedTest and handlePassedTest methods
      const failedSpy = jest.spyOn(issueManager, 'handleFailedTest');
      const passedSpy = jest.spyOn(issueManager, 'handlePassedTest');

      // Create a test file with a pending test
      const testFile = {
        testFilePath: '/path/to/test.js',
        testResults: [mockPendingTest]
      };

      // Call the method
      await issueManager.processTestFile(testFile, { createIssues: true, closeIssues: true });

      // Verify that neither handleFailedTest nor handlePassedTest was called
      expect(failedSpy).not.toHaveBeenCalled();
      expect(passedSpy).not.toHaveBeenCalled();

      // Clean up
      failedSpy.mockRestore();
      passedSpy.mockRestore();
    });
  });

  describe('handleFailedTest', () => {
    it('should update mapping for existing open issue', async () => {
      // Mock getMapping to return an existing open issue
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.js',
        testName: 'Test Suite › test should fail'
      });

      // Call the method
      await issueManager.handleFailedTest('test-identifier', '/path/to/test.js', mockFailingTest);

      // Verify that updateMapping was called with the correct parameters
      expect(mockMappingStore.updateMapping).toHaveBeenCalledWith(
        'test-identifier',
        { lastFailure: mockCurrentDate },
        {},
        '/path/to/test.js',
        mockFailingTest.fullName
      );

      // Verify that createIssue was not called
      expect(mockGithubClient.createIssue).not.toHaveBeenCalled();
    });

    it('should reopen closed issue', async () => {
      // Mock getMapping to return an existing closed issue
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'closed',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.js',
        testName: 'Test Suite › test should fail'
      });

      // Mock reopenIssue to return success
      mockGithubClient.reopenIssue.mockResolvedValue({ success: true });

      // Call the method
      await issueManager.handleFailedTest('test-identifier', '/path/to/test.js', mockFailingTest);

      // Verify that reopenIssue was called with the correct parameters
      expect(mockGithubClient.reopenIssue).toHaveBeenCalledWith(123, 'Reopen comment');

      // Verify that updateMapping was called with the correct parameters
      expect(mockMappingStore.updateMapping).toHaveBeenCalledWith(
        'test-identifier',
        {
          status: 'open',
          lastFailure: mockCurrentDate
        },
        {},
        '/path/to/test.js',
        mockFailingTest.fullName
      );

      // Verify that createIssue was not called
      expect(mockGithubClient.createIssue).not.toHaveBeenCalled();
    });

    it('should not update mapping if reopening issue fails', async () => {
      // Mock getMapping to return an existing closed issue
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'closed',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.js',
        testName: 'Test Suite › test should fail'
      });

      // Mock reopenIssue to return failure
      mockGithubClient.reopenIssue.mockResolvedValue({ success: false });

      // Call the method
      await issueManager.handleFailedTest('test-identifier', '/path/to/test.js', mockFailingTest);

      // Verify that reopenIssue was called with the correct parameters
      expect(mockGithubClient.reopenIssue).toHaveBeenCalledWith(123, 'Reopen comment');

      // Verify that updateMapping was not called
      expect(mockMappingStore.updateMapping).not.toHaveBeenCalled();

      // Verify that createIssue was not called
      expect(mockGithubClient.createIssue).not.toHaveBeenCalled();
    });

    it('should create new issue if no mapping exists', async () => {
      // Mock getMapping to return undefined (no existing issue)
      mockMappingStore.getMapping.mockReturnValue(undefined);

      // Mock createIssue to return success
      mockGithubClient.createIssue.mockResolvedValue({ success: true, issueNumber: 123 });

      // Call the method
      await issueManager.handleFailedTest('test-identifier', '/path/to/test.js', mockFailingTest);

      // Verify that createIssue was called with the correct parameters
      expect(mockGithubClient.createIssue).toHaveBeenCalledWith(
        'Test Failure: test should fail',
        'Issue body',
        ['bug']
      );

      // Verify that setMapping was called with the correct parameters
      expect(mockMappingStore.setMapping).toHaveBeenCalledWith(
        'test-identifier',
        123,
        'open',
        {
          author: 'Test Author',
          commit: '1234567890abcdef',
          message: 'Test commit message'
        },
        '/path/to/test.js',
        mockFailingTest.fullName
      );
    });

    it('should not set mapping if creating issue fails', async () => {
      // Mock getMapping to return undefined (no existing issue)
      mockMappingStore.getMapping.mockReturnValue(undefined);

      // Mock createIssue to return failure
      mockGithubClient.createIssue.mockResolvedValue({ success: false });

      // Call the method
      await issueManager.handleFailedTest('test-identifier', '/path/to/test.js', mockFailingTest);

      // Verify that createIssue was called with the correct parameters
      expect(mockGithubClient.createIssue).toHaveBeenCalledWith(
        'Test Failure: test should fail',
        'Issue body',
        ['bug']
      );

      // Verify that setMapping was not called
      expect(mockMappingStore.setMapping).not.toHaveBeenCalled();
    });

    it('should handle missing parameters', async () => {
      // Call the method with missing parameters
      await issueManager.handleFailedTest();
      await issueManager.handleFailedTest('test-identifier');
      await issueManager.handleFailedTest('test-identifier', '/path/to/test.js');

      // Verify that no GitHub API calls were made
      expect(mockGithubClient.createIssue).not.toHaveBeenCalled();
      expect(mockGithubClient.reopenIssue).not.toHaveBeenCalled();
      expect(mockGithubClient.closeIssue).not.toHaveBeenCalled();

      // Verify that no mapping store calls were made
      expect(mockMappingStore.getMapping).not.toHaveBeenCalled();
      expect(mockMappingStore.setMapping).not.toHaveBeenCalled();
      expect(mockMappingStore.updateMapping).not.toHaveBeenCalled();
    });
  });

  describe('handlePassedTest', () => {
    it('should close open issue', async () => {
      // Mock getMapping to return an existing open issue
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.js',
        testName: 'Test Suite › test should pass'
      });

      // Mock closeIssue to return success
      mockGithubClient.closeIssue.mockResolvedValue({ success: true });

      // Call the method
      await issueManager.handlePassedTest('test-identifier', '/path/to/test.js', mockPassingTest);

      // Verify that closeIssue was called with the correct parameters
      expect(mockGithubClient.closeIssue).toHaveBeenCalledWith(123, 'Close comment');

      // Verify that updateMapping was called with the correct parameters
      expect(mockMappingStore.updateMapping).toHaveBeenCalledWith(
        'test-identifier',
        { status: 'closed' },
        {
          author: 'Test Author',
          commit: '1234567890abcdef',
          message: 'Test commit message'
        },
        '/path/to/test.js',
        mockPassingTest.fullName
      );
    });

    it('should not update mapping if closing issue fails', async () => {
      // Mock getMapping to return an existing open issue
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.js',
        testName: 'Test Suite › test should pass'
      });

      // Mock closeIssue to return failure
      mockGithubClient.closeIssue.mockResolvedValue({ success: false });

      // Call the method
      await issueManager.handlePassedTest('test-identifier', '/path/to/test.js', mockPassingTest);

      // Verify that closeIssue was called with the correct parameters
      expect(mockGithubClient.closeIssue).toHaveBeenCalledWith(123, 'Close comment');

      // Verify that updateMapping was not called
      expect(mockMappingStore.updateMapping).not.toHaveBeenCalled();
    });

    it('should do nothing if no mapping exists', async () => {
      // Mock getMapping to return undefined (no existing issue)
      mockMappingStore.getMapping.mockReturnValue(undefined);

      // Call the method
      await issueManager.handlePassedTest('test-identifier', '/path/to/test.js', mockPassingTest);

      // Verify that no GitHub API calls were made
      expect(mockGithubClient.closeIssue).not.toHaveBeenCalled();

      // Verify that no mapping store calls were made (except getMapping)
      expect(mockMappingStore.updateMapping).not.toHaveBeenCalled();
    });

    it('should do nothing if issue is already closed', async () => {
      // Mock getMapping to return an existing closed issue
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'closed',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.js',
        testName: 'Test Suite › test should pass'
      });

      // Call the method
      await issueManager.handlePassedTest('test-identifier', '/path/to/test.js', mockPassingTest);

      // Verify that no GitHub API calls were made
      expect(mockGithubClient.closeIssue).not.toHaveBeenCalled();

      // Verify that no mapping store calls were made (except getMapping)
      expect(mockMappingStore.updateMapping).not.toHaveBeenCalled();
    });

    it('should handle missing parameters', async () => {
      // Call the method with missing parameters
      await issueManager.handlePassedTest();
      await issueManager.handlePassedTest('test-identifier');
      await issueManager.handlePassedTest('test-identifier', '/path/to/test.js');

      // Verify that no GitHub API calls were made
      expect(mockGithubClient.closeIssue).not.toHaveBeenCalled();

      // Verify that no mapping store calls were made
      expect(mockMappingStore.getMapping).not.toHaveBeenCalled();
      expect(mockMappingStore.updateMapping).not.toHaveBeenCalled();
    });
  });
});
