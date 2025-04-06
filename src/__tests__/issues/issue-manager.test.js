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
  reopenIssue: jest.fn(),
  closeIssue: jest.fn()
};

const mockTemplateManager = {
  generateIssueBody: jest.fn(),
  generateReopenComment: jest.fn(),
  generateCloseComment: jest.fn(),
  getGitInfo: jest.fn()
};

// Mock utility functions
const mockPathRelative = jest.fn();
const mockGetCurrentDate = jest.fn();
const mockGenerateTestId = jest.fn();
const mockGetTestDesc = jest.fn();

describe('IssueManager', () => {
  let issueManager;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockMappingStore.getMapping.mockReturnValue(null);
    mockGithubClient.createIssue.mockResolvedValue({ success: true, issueNumber: 123 });
    mockGithubClient.reopenIssue.mockResolvedValue({ success: true });
    mockGithubClient.closeIssue.mockResolvedValue({ success: true });
    mockTemplateManager.generateIssueBody.mockReturnValue('Issue body');
    mockTemplateManager.generateReopenComment.mockReturnValue('Reopen comment');
    mockTemplateManager.generateCloseComment.mockReturnValue('Close comment');
    mockTemplateManager.getGitInfo.mockReturnValue({ commit: 'abc123' });
    mockPathRelative.mockReturnValue('relative/path/to/test.js');
    mockGetCurrentDate.mockReturnValue('2023-01-01T00:00:00.000Z');
    mockGenerateTestId.mockReturnValue('test-id-123');
    mockGetTestDesc.mockReturnValue('Test Description');
  });
  
  describe('constructor', () => {
    it('should create an instance with the old constructor signature', () => {
      // Create issue manager with old constructor signature
      issueManager = new IssueManager(mockMappingStore, mockGithubClient);
      
      expect(issueManager.mappingStore).toBe(mockMappingStore);
      expect(issueManager.githubClient).toBe(mockGithubClient);
      expect(issueManager.templateManager).toBeDefined();
    });
    
    it('should create an instance with the new constructor signature', () => {
      // Create issue manager with new constructor signature
      issueManager = new IssueManager({
        mappingStore: mockMappingStore,
        githubClient: mockGithubClient,
        templateManager: mockTemplateManager,
        pathRelative: mockPathRelative,
        getCurrentDate: mockGetCurrentDate,
        generateTestId: mockGenerateTestId,
        getTestDesc: mockGetTestDesc
      });
      
      expect(issueManager.mappingStore).toBe(mockMappingStore);
      expect(issueManager.githubClient).toBe(mockGithubClient);
      expect(issueManager.templateManager).toBe(mockTemplateManager);
      expect(issueManager.pathRelative).toBe(mockPathRelative);
      expect(issueManager.getCurrentDate).toBe(mockGetCurrentDate);
      expect(issueManager.generateTestId).toBe(mockGenerateTestId);
      expect(issueManager.getTestDesc).toBe(mockGetTestDesc);
    });
    
    it('should throw an error if required dependencies are missing', () => {
      expect(() => {
        new IssueManager();
      }).toThrow('Missing required dependencies');
      
      expect(() => {
        new IssueManager({});
      }).toThrow('Missing required dependencies');
      
      expect(() => {
        new IssueManager({ mappingStore: mockMappingStore });
      }).toThrow('Missing required dependencies');
      
      expect(() => {
        new IssueManager({ githubClient: mockGithubClient });
      }).toThrow('Missing required dependencies');
    });
  });
  
  describe('processTestResults', () => {
    beforeEach(() => {
      // Create issue manager with mocked dependencies
      issueManager = new IssueManager({
        mappingStore: mockMappingStore,
        githubClient: mockGithubClient,
        templateManager: mockTemplateManager,
        pathRelative: mockPathRelative,
        getCurrentDate: mockGetCurrentDate,
        generateTestId: mockGenerateTestId,
        getTestDesc: mockGetTestDesc
      });
    });
    
    it('should process each test file', async () => {
      // Spy on processTestFile
      const processTestFileSpy = jest.spyOn(issueManager, 'processTestFile');
      
      // Create test results
      const testResults = [
        { testFilePath: 'file1.js', testResults: [] },
        { testFilePath: 'file2.js', testResults: [] }
      ];
      
      // Call the method
      await issueManager.processTestResults(testResults);
      
      // Verify processTestFile was called for each test file
      expect(processTestFileSpy).toHaveBeenCalledTimes(2);
      expect(processTestFileSpy).toHaveBeenCalledWith(testResults[0], { createIssues: true, closeIssues: true });
      expect(processTestFileSpy).toHaveBeenCalledWith(testResults[1], { createIssues: true, closeIssues: true });
    });
    
    it('should handle null or non-array test results', async () => {
      // Spy on processTestFile
      const processTestFileSpy = jest.spyOn(issueManager, 'processTestFile');
      
      // Call the method with null
      await issueManager.processTestResults(null);
      
      // Verify processTestFile was not called
      expect(processTestFileSpy).not.toHaveBeenCalled();
      
      // Call the method with non-array
      await issueManager.processTestResults('not an array');
      
      // Verify processTestFile was not called
      expect(processTestFileSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('processTestFile', () => {
    beforeEach(() => {
      // Create issue manager with mocked dependencies
      issueManager = new IssueManager({
        mappingStore: mockMappingStore,
        githubClient: mockGithubClient,
        templateManager: mockTemplateManager,
        pathRelative: mockPathRelative,
        getCurrentDate: mockGetCurrentDate,
        generateTestId: mockGenerateTestId,
        getTestDesc: mockGetTestDesc
      });
    });
    
    it('should process each test result in a file', async () => {
      // Spy on handleFailedTest and handlePassedTest
      const handleFailedTestSpy = jest.spyOn(issueManager, 'handleFailedTest');
      const handlePassedTestSpy = jest.spyOn(issueManager, 'handlePassedTest');
      
      // Create test file with results
      const testFile = {
        testFilePath: 'file1.js',
        testResults: [
          { fullName: 'Test 1', status: 'failed' },
          { fullName: 'Test 2', status: 'passed' }
        ]
      };
      
      // Call the method
      await issueManager.processTestFile(testFile, { createIssues: true, closeIssues: true });
      
      // Verify path relative was called
      expect(mockPathRelative).toHaveBeenCalledWith(process.cwd(), 'file1.js');
      
      // Verify generateTestId was called for each test
      expect(mockGenerateTestId).toHaveBeenCalledTimes(2);
      expect(mockGenerateTestId).toHaveBeenCalledWith('relative/path/to/test.js', 'Test 1');
      expect(mockGenerateTestId).toHaveBeenCalledWith('relative/path/to/test.js', 'Test 2');
      
      // Verify handleFailedTest was called for the failed test
      expect(handleFailedTestSpy).toHaveBeenCalledWith('test-id-123', 'relative/path/to/test.js', testFile.testResults[0]);
      
      // Verify handlePassedTest was called for the passed test
      expect(handlePassedTestSpy).toHaveBeenCalledWith('test-id-123', 'relative/path/to/test.js', testFile.testResults[1]);
    });
  });
  
  describe('handleFailedTest', () => {
    beforeEach(() => {
      // Create issue manager with mocked dependencies
      issueManager = new IssueManager({
        mappingStore: mockMappingStore,
        githubClient: mockGithubClient,
        templateManager: mockTemplateManager,
        pathRelative: mockPathRelative,
        getCurrentDate: mockGetCurrentDate,
        generateTestId: mockGenerateTestId,
        getTestDesc: mockGetTestDesc
      });
    });
    
    it('should create new issue if no mapping exists', async () => {
      // Setup mapping store to return null (no existing issue)
      mockMappingStore.getMapping.mockReturnValue(null);
      
      // Call the method
      await issueManager.handleFailedTest('test-id-123', 'file1.js', { fullName: 'Test 1' });
      
      // Verify template manager was called
      expect(mockTemplateManager.generateIssueBody).toHaveBeenCalledWith(
        { fullName: 'Test 1' },
        'file1.js'
      );
      
      // Verify test description was generated
      expect(mockGetTestDesc).toHaveBeenCalledWith('Test 1');
      
      // Verify GitHub API was called
      expect(mockGithubClient.createIssue).toHaveBeenCalledWith(
        'Test Failure: Test Description',
        'Issue body',
        ['bug']
      );
      
      // Verify git info was retrieved
      expect(mockTemplateManager.getGitInfo).toHaveBeenCalled();
      
      // Verify mapping was set
      expect(mockMappingStore.setMapping).toHaveBeenCalledWith(
        'test-id-123',
        123,
        'open',
        { commit: 'abc123' },
        'file1.js',
        'Test 1'
      );
    });
  });
  
  describe('handlePassedTest', () => {
    beforeEach(() => {
      // Create issue manager with mocked dependencies
      issueManager = new IssueManager({
        mappingStore: mockMappingStore,
        githubClient: mockGithubClient,
        templateManager: mockTemplateManager,
        pathRelative: mockPathRelative,
        getCurrentDate: mockGetCurrentDate,
        generateTestId: mockGenerateTestId,
        getTestDesc: mockGetTestDesc
      });
    });
    
    it('should close open issue', async () => {
      // Setup mapping store to return an open issue
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open'
      });
      
      // Call the method
      await issueManager.handlePassedTest('test-id-123', 'file1.js', { fullName: 'Test 1' });
      
      // Verify template manager was called
      expect(mockTemplateManager.generateCloseComment).toHaveBeenCalledWith(
        { fullName: 'Test 1' },
        'file1.js',
        { issueNumber: 123, status: 'open' }
      );
      
      // Verify GitHub API was called
      expect(mockGithubClient.closeIssue).toHaveBeenCalledWith(123, 'Close comment');
      
      // Verify git info was retrieved
      expect(mockTemplateManager.getGitInfo).toHaveBeenCalled();
      
      // Verify mapping was updated
      expect(mockMappingStore.updateMapping).toHaveBeenCalledWith(
        'test-id-123',
        { status: 'closed' },
        { commit: 'abc123' },
        'file1.js',
        'Test 1'
      );
    });
  });
});
