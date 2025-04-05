// @ts-nocheck
import { jest } from '@jest/globals';
import { IssueManager } from '../../issues/issue-manager';
import { PluginManager } from '../../plugins/plugin-manager';
import { mockFailingTest, mockPassingTest, mockTestFileResults, mockTestResults } from '../mocks/test-results.mock';
import { generateTestIdentifier } from '../../utils/test-identifier';
import { IBugTracker, BugInfo } from '../../trackers/bug-tracker.interface';

describe('IssueManager', () => {
  let issueManager: IssueManager;
  let mockBugTracker: IBugTracker;
  let mockPluginManager: PluginManager;
  let bugs: Record<string, BugInfo> = {};

  beforeEach(() => {
    // Reset bugs
    bugs = {};

    // Create mock dependencies
    // @ts-ignore
    mockBugTracker = {
      // @ts-ignore
      initialize: jest.fn().mockResolvedValue(undefined),
      // @ts-ignore
      bugExists: jest.fn().mockImplementation((testIdentifier: string) => Promise.resolve(!!bugs[testIdentifier])),
      // @ts-ignore
      getBug: jest.fn().mockImplementation((testIdentifier: string) => Promise.resolve(bugs[testIdentifier] || null)),
      // @ts-ignore
      createBug: jest.fn().mockImplementation((testIdentifier: string, test: any, testFilePath: string) => {
        const bug: BugInfo = {
          id: '123',
          status: 'open',
          testIdentifier,
          testFilePath,
          testName: test.fullName,
          lastFailure: new Date().toISOString(),
          lastUpdate: new Date().toISOString()
        };
        bugs[testIdentifier] = bug;
        return Promise.resolve(bug);
      }),
      // @ts-ignore
      closeBug: jest.fn().mockImplementation((testIdentifier: string, test: any, testFilePath: string) => {
        const bug = bugs[testIdentifier];
        if (!bug) {
          return Promise.reject(new Error(`No bug found for test: ${testIdentifier}`));
        }
        bug.status = 'closed';
        bug.lastUpdate = new Date().toISOString();
        return Promise.resolve(bug);
      }),
      // @ts-ignore
      reopenBug: jest.fn().mockImplementation((testIdentifier: string, test: any, testFilePath: string) => {
        const bug = bugs[testIdentifier];
        if (!bug) {
          return Promise.reject(new Error(`No bug found for test: ${testIdentifier}`));
        }
        bug.status = 'open';
        bug.lastFailure = new Date().toISOString();
        bug.lastUpdate = new Date().toISOString();
        return Promise.resolve(bug);
      }),
      // @ts-ignore
      updateBug: jest.fn().mockImplementation((testIdentifier: string, test: any, testFilePath: string) => {
        const bug = bugs[testIdentifier];
        if (!bug) {
          return Promise.reject(new Error(`No bug found for test: ${testIdentifier}`));
        }
        bug.lastFailure = new Date().toISOString();
        bug.lastUpdate = new Date().toISOString();
        return Promise.resolve(bug);
      }),
      // @ts-ignore
      getAllBugs: jest.fn().mockImplementation(() => Promise.resolve({ ...bugs }))
    };

    // Create a plugin manager with a test plugin
    const testPlugin = {
      name: 'TestPlugin',
      beforeCreateIssue: jest.fn().mockResolvedValue(undefined),
      afterCreateIssue: jest.fn().mockResolvedValue(undefined),
      beforeCloseIssue: jest.fn().mockResolvedValue(undefined),
      afterCloseIssue: jest.fn().mockResolvedValue(undefined),
      beforeReopenIssue: jest.fn().mockResolvedValue(undefined),
      afterReopenIssue: jest.fn().mockResolvedValue(undefined)
    };

    mockPluginManager = new PluginManager([testPlugin]);
    jest.spyOn(mockPluginManager, 'beforeCreateIssue');
    jest.spyOn(mockPluginManager, 'afterCreateIssue');
    jest.spyOn(mockPluginManager, 'beforeCloseIssue');
    jest.spyOn(mockPluginManager, 'afterCloseIssue');
    jest.spyOn(mockPluginManager, 'beforeReopenIssue');
    jest.spyOn(mockPluginManager, 'afterReopenIssue');

    issueManager = new IssueManager(
      mockBugTracker,
      mockPluginManager,
      {
        generateIssues: true,
        trackIssues: true,
        closeIssues: true,
        reopenIssues: true
      }
    );
  });

  describe('processTestResults', () => {
    it('should process test results', async () => {
      // Spy on the processTestFile method
      jest.spyOn(issueManager, 'processTestFile').mockResolvedValue(undefined);

      await issueManager.processTestResults(mockTestResults);

      // Should call processTestFile for each test file
      expect(issueManager.processTestFile).toHaveBeenCalledWith(
        mockTestFileResults.testFilePath,
        mockTestFileResults,
        expect.any(Object)
      );
    });

    it('should handle empty test results', async () => {
      // Spy on the processTestFile method
      jest.spyOn(issueManager, 'processTestFile').mockResolvedValue(undefined);

      await issueManager.processTestResults({});

      // Should not call processTestFile
      expect(issueManager.processTestFile).not.toHaveBeenCalled();
    });

    it('should skip processing if both generateIssues and trackIssues are false', async () => {
      // Spy on the processTestFile method
      jest.spyOn(issueManager, 'processTestFile').mockResolvedValue(undefined);

      // Create a new issue manager with generateIssues and trackIssues set to false
      const testIssueManager = new IssueManager(
        mockBugTracker,
        mockPluginManager,
        {
          generateIssues: false,
          trackIssues: false,
          closeIssues: true,
          reopenIssues: true
        }
      );

      await testIssueManager.processTestResults(mockTestResults);

      // Should not call processTestFile
      expect(issueManager.processTestFile).not.toHaveBeenCalled();
    });
  });

  describe('processTestFile', () => {
    it('should process a test file', async () => {
      // Spy on the handleFailedTest and handlePassedTest methods
      jest.spyOn(issueManager, 'handleFailedTest').mockResolvedValue(undefined);
      jest.spyOn(issueManager, 'handlePassedTest').mockResolvedValue(undefined);

      await issueManager.processTestFile(mockTestFileResults.testFilePath, mockTestFileResults);

      // Should call handleFailedTest and handlePassedTest for each test
      expect(issueManager.handleFailedTest).toHaveBeenCalledWith(
        expect.any(String),
        mockTestFileResults.testFilePath,
        mockFailingTest,
        expect.any(Object)
      );
      expect(issueManager.handlePassedTest).toHaveBeenCalledWith(
        expect.any(String),
        mockTestFileResults.testFilePath,
        mockPassingTest,
        expect.any(Object)
      );
    });

    it('should handle empty test file results', async () => {
      // Spy on the handleFailedTest and handlePassedTest methods
      jest.spyOn(issueManager, 'handleFailedTest').mockResolvedValue(undefined);
      jest.spyOn(issueManager, 'handlePassedTest').mockResolvedValue(undefined);

      await issueManager.processTestFile('/path/to/test.ts', {});

      // Should not call handleFailedTest or handlePassedTest
      expect(issueManager.handleFailedTest).not.toHaveBeenCalled();
      expect(issueManager.handlePassedTest).not.toHaveBeenCalled();
    });

    it('should skip processing if both generateIssues and trackIssues are false', async () => {
      // Spy on the handleFailedTest and handlePassedTest methods
      jest.spyOn(issueManager, 'handleFailedTest').mockResolvedValue(undefined);
      jest.spyOn(issueManager, 'handlePassedTest').mockResolvedValue(undefined);

      // Create a new issue manager with generateIssues and trackIssues set to false
      const testIssueManager = new IssueManager(
        mockBugTracker,
        mockPluginManager,
        {
          generateIssues: false,
          trackIssues: false,
          closeIssues: true,
          reopenIssues: true
        }
      );

      await testIssueManager.processTestFile(mockTestFileResults.testFilePath, mockTestFileResults);

      // Should not call handleFailedTest or handlePassedTest
      expect(issueManager.handleFailedTest).not.toHaveBeenCalled();
      expect(issueManager.handlePassedTest).not.toHaveBeenCalled();
    });
  });

  describe('handleFailedTest', () => {
    it('should skip handling a failed test if the test file should not be included', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock the filterUtils.shouldIncludeTest method to return false
      // @ts-ignore
      issueManager.filterUtils.shouldIncludeTest = jest.fn().mockReturnValue(false);

      // Call handleFailedTest
      await issueManager.handleFailedTest(testIdentifier, testFilePath, mockFailingTest);

      // Verify that the bug tracker methods were not called
      expect(mockBugTracker.bugExists).not.toHaveBeenCalled();
      expect(mockBugTracker.createBug).not.toHaveBeenCalled();
      expect(mockBugTracker.reopenBug).not.toHaveBeenCalled();
    });

    it('should skip handling a failed test if issue creation should be skipped', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock the filterUtils methods
      // @ts-ignore
      issueManager.filterUtils.shouldIncludeTest = jest.fn().mockReturnValue(true);
      // @ts-ignore
      issueManager.filterUtils.shouldSkipIssueCreation = jest.fn().mockReturnValue(true);

      // Call handleFailedTest
      await issueManager.handleFailedTest(testIdentifier, testFilePath, mockFailingTest);

      // Verify that the bug tracker methods were not called
      expect(mockBugTracker.bugExists).not.toHaveBeenCalled();
      expect(mockBugTracker.createBug).not.toHaveBeenCalled();
      expect(mockBugTracker.reopenBug).not.toHaveBeenCalled();
    });

    it('should skip handling a failed test if issues should not be created on the current branch', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock the filterUtils methods
      // @ts-ignore
      issueManager.filterUtils.shouldIncludeTest = jest.fn().mockReturnValue(true);
      // @ts-ignore
      issueManager.filterUtils.shouldSkipIssueCreation = jest.fn().mockReturnValue(false);
      // @ts-ignore
      issueManager.filterUtils.shouldCreateIssuesOnCurrentBranch = jest.fn().mockReturnValue(false);

      // Call handleFailedTest
      await issueManager.handleFailedTest(testIdentifier, testFilePath, mockFailingTest);

      // Verify that the bug tracker methods were not called
      expect(mockBugTracker.bugExists).not.toHaveBeenCalled();
      expect(mockBugTracker.createBug).not.toHaveBeenCalled();
      expect(mockBugTracker.reopenBug).not.toHaveBeenCalled();
    });
    it('should create a new bug for a failing test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return false
      // @ts-ignore
      mockBugTracker.bugExists.mockResolvedValue(false);

      await issueManager.handleFailedTest(testIdentifier, testFilePath, mockFailingTest);

      expect(mockPluginManager.beforeCreateIssue).toHaveBeenCalledWith(mockFailingTest, testFilePath);
      expect(mockBugTracker.createBug).toHaveBeenCalledWith(testIdentifier, mockFailingTest, testFilePath);
      expect(mockPluginManager.afterCreateIssue).toHaveBeenCalledWith(mockFailingTest, testFilePath, 123);
    });

    it('should update an existing open bug for a failing test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return true
      mockBugTracker.bugExists.mockResolvedValue(true);

      // Mock getBug to return an open bug
      mockBugTracker.getBug.mockResolvedValue({
        id: '123',
        status: 'open',
        testIdentifier,
        testFilePath,
        testName: mockFailingTest.fullName,
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z'
      });

      await issueManager.handleFailedTest(testIdentifier, testFilePath, mockFailingTest);

      expect(mockBugTracker.updateBug).toHaveBeenCalledWith(testIdentifier, mockFailingTest, testFilePath);
      expect(mockBugTracker.createBug).not.toHaveBeenCalled();
    });

    it('should reopen a closed bug for a failing test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Create a test plugin
      const testPlugin = {
        name: 'TestPlugin',
        init: jest.fn(),
        beforeCreateIssue: jest.fn().mockResolvedValue(undefined),
        afterCreateIssue: jest.fn().mockResolvedValue(undefined),
        beforeCloseIssue: jest.fn().mockResolvedValue(undefined),
        afterCloseIssue: jest.fn().mockResolvedValue(undefined),
        beforeReopenIssue: jest.fn().mockResolvedValue(undefined),
        afterReopenIssue: jest.fn().mockResolvedValue(undefined)
      };

      // Create a plugin manager with the test plugin
      const pluginManager = new PluginManager([testPlugin]);

      // Create a new bug tracker that will call the plugin methods
      const testBugTracker = {
        initialize: jest.fn().mockResolvedValue(undefined),
        bugExists: jest.fn().mockResolvedValue(true),
        getBug: jest.fn().mockResolvedValue({
          id: '123',
          status: 'closed',
          testIdentifier,
          testFilePath,
          testName: mockFailingTest.fullName,
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z'
        }),
        createBug: jest.fn().mockResolvedValue({
          id: '123',
          status: 'open',
          testIdentifier,
          testFilePath,
          testName: mockFailingTest.fullName,
          lastFailure: new Date().toISOString(),
          lastUpdate: new Date().toISOString()
        }),
        reopenBug: jest.fn().mockImplementation(async (testId, test, filePath) => {
          // Call the plugin methods directly
          await testPlugin.beforeReopenIssue(test, filePath, 123);
          const result = {
            id: '123',
            status: 'open',
            testIdentifier: testId,
            testFilePath: filePath,
            testName: test.fullName,
            lastFailure: new Date().toISOString(),
            lastUpdate: new Date().toISOString()
          };
          await testPlugin.afterReopenIssue(test, filePath, 123);
          return result;
        }),
        closeBug: jest.fn().mockResolvedValue({
          id: '123',
          status: 'closed',
          testIdentifier,
          testFilePath,
          testName: mockFailingTest.fullName,
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: new Date().toISOString(),
          fixedBy: 'Test User',
          fixCommit: '1234567890abcdef',
          fixMessage: 'Fix test'
        }),
        updateBug: jest.fn().mockResolvedValue({
          id: '123',
          status: 'open',
          testIdentifier,
          testFilePath,
          testName: mockFailingTest.fullName,
          lastFailure: new Date().toISOString(),
          lastUpdate: new Date().toISOString()
        }),
        getAllBugs: jest.fn().mockResolvedValue({})
      };

      // Create a new issue manager with the test bug tracker and plugin manager
      const testIssueManager = new IssueManager(
        testBugTracker,
        pluginManager,
        {
          generateIssues: true,
          trackIssues: true,
          closeIssues: true,
          reopenIssues: true
        }
      );

      await testIssueManager.handleFailedTest(testIdentifier, testFilePath, mockFailingTest);

      expect(testPlugin.beforeReopenIssue).toHaveBeenCalledWith(mockFailingTest, testFilePath, 123);
      expect(testBugTracker.reopenBug).toHaveBeenCalledWith(testIdentifier, mockFailingTest, testFilePath);
      expect(testPlugin.afterReopenIssue).toHaveBeenCalledWith(mockFailingTest, testFilePath, 123);
    });

    it('should not create a bug if generateIssues is false', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return false
      mockBugTracker.bugExists.mockResolvedValue(false);

      issueManager = new IssueManager(
        mockBugTracker,
        mockPluginManager,
        {
          generateIssues: false,
          trackIssues: true,
          closeIssues: true,
          reopenIssues: true
        }
      );

      await issueManager.handleFailedTest(testIdentifier, testFilePath, mockFailingTest);

      expect(mockBugTracker.createBug).not.toHaveBeenCalled();
    });

    it('should not reopen a bug if reopenIssues is false', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return true
      mockBugTracker.bugExists.mockResolvedValue(true);

      // Mock getBug to return a closed bug
      mockBugTracker.getBug.mockResolvedValue({
        id: '123',
        status: 'closed',
        testIdentifier,
        testFilePath,
        testName: mockFailingTest.fullName,
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z'
      });

      issueManager = new IssueManager(
        mockBugTracker,
        mockPluginManager,
        {
          generateIssues: true,
          trackIssues: true,
          closeIssues: true,
          reopenIssues: false
        }
      );

      await issueManager.handleFailedTest(testIdentifier, testFilePath, mockFailingTest);

      expect(mockBugTracker.reopenBug).not.toHaveBeenCalled();
    });
  });

  describe('handlePassedTest', () => {
    it('should skip handling a passing test if the test file should not be included', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock the filterUtils.shouldIncludeTest method to return false
      // @ts-ignore
      issueManager.filterUtils.shouldIncludeTest = jest.fn().mockReturnValue(false);

      // Call handlePassedTest
      await issueManager.handlePassedTest(testIdentifier, testFilePath, mockPassingTest);

      // Verify that the bug tracker methods were not called
      expect(mockBugTracker.bugExists).not.toHaveBeenCalled();
      expect(mockBugTracker.closeBug).not.toHaveBeenCalled();
    });

    it('should skip handling a passing test if issue creation should be skipped', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock the filterUtils methods
      // @ts-ignore
      issueManager.filterUtils.shouldIncludeTest = jest.fn().mockReturnValue(true);
      // @ts-ignore
      issueManager.filterUtils.shouldSkipIssueCreation = jest.fn().mockReturnValue(true);

      // Call handlePassedTest
      await issueManager.handlePassedTest(testIdentifier, testFilePath, mockPassingTest);

      // Verify that the bug tracker methods were not called
      expect(mockBugTracker.bugExists).not.toHaveBeenCalled();
      expect(mockBugTracker.closeBug).not.toHaveBeenCalled();
    });

    it('should skip handling a passing test if issues should not be created on the current branch', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock the filterUtils methods
      // @ts-ignore
      issueManager.filterUtils.shouldIncludeTest = jest.fn().mockReturnValue(true);
      // @ts-ignore
      issueManager.filterUtils.shouldSkipIssueCreation = jest.fn().mockReturnValue(false);
      // @ts-ignore
      issueManager.filterUtils.shouldCreateIssuesOnCurrentBranch = jest.fn().mockReturnValue(false);

      // Call handlePassedTest
      await issueManager.handlePassedTest(testIdentifier, testFilePath, mockPassingTest);

      // Verify that the bug tracker methods were not called
      expect(mockBugTracker.bugExists).not.toHaveBeenCalled();
      expect(mockBugTracker.closeBug).not.toHaveBeenCalled();
    });
    it('should close an open bug for a passing test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Create a test plugin
      const testPlugin = {
        name: 'TestPlugin',
        init: jest.fn(),
        beforeCreateIssue: jest.fn().mockResolvedValue(undefined),
        afterCreateIssue: jest.fn().mockResolvedValue(undefined),
        beforeCloseIssue: jest.fn().mockResolvedValue(undefined),
        afterCloseIssue: jest.fn().mockResolvedValue(undefined),
        beforeReopenIssue: jest.fn().mockResolvedValue(undefined),
        afterReopenIssue: jest.fn().mockResolvedValue(undefined)
      };

      // Create a plugin manager with the test plugin
      const pluginManager = new PluginManager([testPlugin]);

      // Create a new bug tracker that will call the plugin methods
      const testBugTracker = {
        initialize: jest.fn().mockResolvedValue(undefined),
        bugExists: jest.fn().mockResolvedValue(true),
        getBug: jest.fn().mockResolvedValue({
          id: '123',
          status: 'open',
          testIdentifier,
          testFilePath,
          testName: mockPassingTest.fullName,
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z'
        }),
        createBug: jest.fn().mockResolvedValue({
          id: '123',
          status: 'open',
          testIdentifier,
          testFilePath,
          testName: mockPassingTest.fullName,
          lastFailure: new Date().toISOString(),
          lastUpdate: new Date().toISOString()
        }),
        reopenBug: jest.fn().mockResolvedValue({
          id: '123',
          status: 'open',
          testIdentifier,
          testFilePath,
          testName: mockPassingTest.fullName,
          lastFailure: new Date().toISOString(),
          lastUpdate: new Date().toISOString()
        }),
        closeBug: jest.fn().mockImplementation(async (testId, test, filePath) => {
          // Call the plugin methods directly
          await testPlugin.beforeCloseIssue(test, filePath, 123);
          const result = {
            id: '123',
            status: 'closed',
            testIdentifier: testId,
            testFilePath: filePath,
            testName: test.fullName,
            lastFailure: '2023-01-01T00:00:00.000Z',
            lastUpdate: new Date().toISOString(),
            fixedBy: 'Test User',
            fixCommit: '1234567890abcdef',
            fixMessage: 'Fix test'
          };
          await testPlugin.afterCloseIssue(test, filePath, 123);
          return result;
        }),
        updateBug: jest.fn().mockResolvedValue({
          id: '123',
          status: 'open',
          testIdentifier,
          testFilePath,
          testName: mockPassingTest.fullName,
          lastFailure: new Date().toISOString(),
          lastUpdate: new Date().toISOString()
        }),
        getAllBugs: jest.fn().mockResolvedValue({})
      };

      // Create a new issue manager with the test bug tracker and plugin manager
      const testIssueManager = new IssueManager(
        testBugTracker,
        pluginManager,
        {
          generateIssues: true,
          trackIssues: true,
          closeIssues: true,
          reopenIssues: true
        }
      );

      await testIssueManager.handlePassedTest(testIdentifier, testFilePath, mockPassingTest);

      expect(testPlugin.beforeCloseIssue).toHaveBeenCalledWith(mockPassingTest, testFilePath, 123);
      expect(testBugTracker.closeBug).toHaveBeenCalledWith(testIdentifier, mockPassingTest, testFilePath);
      expect(testPlugin.afterCloseIssue).toHaveBeenCalledWith(mockPassingTest, testFilePath, 123);
    });

    it('should not close a bug if closeIssues is false', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return true
      mockBugTracker.bugExists.mockResolvedValue(true);

      // Mock getBug to return an open bug
      mockBugTracker.getBug.mockResolvedValue({
        id: '123',
        status: 'open',
        testIdentifier,
        testFilePath,
        testName: mockPassingTest.fullName,
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z'
      });

      issueManager = new IssueManager(
        mockBugTracker,
        mockPluginManager,
        {
          generateIssues: true,
          trackIssues: true,
          closeIssues: false,
          reopenIssues: true
        }
      );

      await issueManager.handlePassedTest(testIdentifier, testFilePath, mockPassingTest);

      expect(mockBugTracker.closeBug).not.toHaveBeenCalled();
    });

    it('should do nothing for a passing test with no bug', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return false
      mockBugTracker.bugExists.mockResolvedValue(false);

      await issueManager.handlePassedTest(testIdentifier, testFilePath, mockPassingTest);

      expect(mockBugTracker.closeBug).not.toHaveBeenCalled();
    });

    it('should do nothing for a passing test with a closed bug', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return true
      mockBugTracker.bugExists.mockResolvedValue(true);

      // Mock getBug to return a closed bug
      mockBugTracker.getBug.mockResolvedValue({
        id: '123',
        status: 'closed',
        testIdentifier,
        testFilePath,
        testName: mockPassingTest.fullName,
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z'
      });

      await issueManager.handlePassedTest(testIdentifier, testFilePath, mockPassingTest);

      expect(mockBugTracker.closeBug).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle errors when creating a bug', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return false
      mockBugTracker.bugExists.mockResolvedValue(false);

      // Mock createBug to throw an error
      mockBugTracker.createBug.mockRejectedValue(new Error('Failed to create bug'));

      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await issueManager.handleFailedTest(testIdentifier, testFilePath, mockFailingTest);

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors when reopening a bug', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return true
      mockBugTracker.bugExists.mockResolvedValue(true);

      // Mock getBug to return a closed bug
      mockBugTracker.getBug.mockResolvedValue({
        id: '123',
        status: 'closed',
        testIdentifier,
        testFilePath,
        testName: mockFailingTest.fullName,
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z'
      });

      // Mock reopenBug to throw an error
      mockBugTracker.reopenBug.mockRejectedValue(new Error('Failed to reopen bug'));

      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await issueManager.handleFailedTest(testIdentifier, testFilePath, mockFailingTest);

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors when a bug exists but cannot be retrieved', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return true
      mockBugTracker.bugExists.mockResolvedValue(true);

      // Mock getBug to return null
      mockBugTracker.getBug.mockResolvedValue(null);

      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await issueManager.handleFailedTest(testIdentifier, testFilePath, mockFailingTest);

      expect(console.error).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Bug exists but could not be retrieved'));
    });

    it('should handle errors when closing a bug', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return true
      mockBugTracker.bugExists.mockResolvedValue(true);

      // Mock getBug to return an open bug
      mockBugTracker.getBug.mockResolvedValue({
        id: '123',
        status: 'open',
        testIdentifier,
        testFilePath,
        testName: mockPassingTest.fullName,
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z'
      });

      // Mock closeBug to throw an error
      mockBugTracker.closeBug.mockRejectedValue(new Error('Failed to close bug'));

      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await issueManager.handlePassedTest(testIdentifier, testFilePath, mockPassingTest);

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors when a bug exists but cannot be retrieved in handlePassedTest', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock bugExists to return true
      mockBugTracker.bugExists.mockResolvedValue(true);

      // Mock getBug to return null
      mockBugTracker.getBug.mockResolvedValue(null);

      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await issueManager.handlePassedTest(testIdentifier, testFilePath, mockPassingTest);

      expect(console.error).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Bug exists but could not be retrieved'));
    });
  });

  describe('handleError', () => {
    it('should log the error with the prefix', () => {
      // Mock console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('Test error');

      // @ts-ignore - Accessing private method for testing
      issueManager.handleError(error, 'Test prefix');

      expect(console.error).toHaveBeenCalledWith('Test prefix: Test error');
    });
  });

  describe('formatError', () => {
    it('should format Error objects', () => {
      const error = new Error('Test error');

      // @ts-ignore - Accessing private method for testing
      const result = issueManager.formatError(error);

      expect(result).toBe('Test error');
    });

    it('should format non-Error objects', () => {
      const error = 'String error';

      // @ts-ignore - Accessing private method for testing
      const result = issueManager.formatError(error);

      expect(result).toBe('String error');
    });

    it('should handle null and undefined', () => {
      // @ts-ignore - Accessing private method for testing
      const result1 = issueManager.formatError(null);
      // @ts-ignore - Accessing private method for testing
      const result2 = issueManager.formatError(undefined);

      expect(result1).toBe('null');
      expect(result2).toBe('undefined');
    });
  });

  describe('initializeOptions', () => {
    it('should return default options when options is undefined', () => {
      // @ts-ignore - Accessing private method for testing
      const result = issueManager.initializeOptions(undefined);

      expect(result).toEqual({
        generateIssues: false,
        trackIssues: false,
        closeIssues: true,
        reopenIssues: true,
        config: {}
      });
    });

    it('should return default options when options is null', () => {
      // @ts-ignore - Accessing private method for testing
      const result = issueManager.initializeOptions(null);

      expect(result).toEqual({
        generateIssues: false,
        trackIssues: false,
        closeIssues: true,
        reopenIssues: true,
        config: {}
      });
    });

    it('should use provided options when available', () => {
      const options = {
        generateIssues: true,
        trackIssues: true,
        closeIssues: false,
        reopenIssues: false,
        config: {}
      };

      // @ts-ignore - Accessing private method for testing
      const result = issueManager.initializeOptions(options);

      expect(result).toEqual(options);
    });

    it('should use defaults for missing options', () => {
      const options = {
        generateIssues: true
      };

      // @ts-ignore - Accessing private method for testing
      const result = issueManager.initializeOptions(options);

      expect(result).toEqual({
        generateIssues: true,
        trackIssues: false,
        closeIssues: true,
        reopenIssues: true,
        config: {}
      });
    });

    it('should handle undefined config', () => {
      const options = {
        generateIssues: true,
        trackIssues: true,
        closeIssues: false,
        reopenIssues: false,
        config: undefined
      };

      // @ts-ignore - Accessing private method for testing
      const result = issueManager.initializeOptions(options);

      expect(result).toEqual({
        generateIssues: true,
        trackIssues: true,
        closeIssues: false,
        reopenIssues: false,
        config: {}
      });
    });
  });
});
