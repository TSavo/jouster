// @ts-nocheck
import { jest } from '@jest/globals';
import { IBugTracker, BugInfo } from '../../trackers/bug-tracker.interface';
import { TestResult } from '../../types';

/**
 * Mock bug tracker for testing
 */
export class MockBugTracker implements IBugTracker {
  private bugs: Record<string, BugInfo> = {};

  // Mock functions
  public initialize = jest.fn().mockImplementation((): Promise<void> => Promise.resolve());
  public bugExists = jest.fn().mockImplementation((testIdentifier: string): Promise<boolean> => Promise.resolve(!!this.bugs[testIdentifier]));
  public getBug = jest.fn().mockImplementation((testIdentifier: string): Promise<BugInfo | null> => Promise.resolve(this.bugs[testIdentifier] || null));
  public createBug = jest.fn().mockImplementation((testIdentifier: string, test: TestResult, testFilePath: string): Promise<BugInfo> => {
    const bug: BugInfo = {
      id: '123',
      status: 'open',
      testIdentifier,
      testFilePath,
      testName: test.fullName,
      lastFailure: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };
    this.bugs[testIdentifier] = bug;
    return Promise.resolve(bug);
  });
  public closeBug = jest.fn().mockImplementation((testIdentifier: string, test: TestResult, testFilePath: string): Promise<BugInfo> => {
    const bug = this.bugs[testIdentifier];
    if (!bug) {
      return Promise.reject(new Error(`No bug found for test: ${testIdentifier}`));
    }
    bug.status = 'closed';
    bug.lastUpdate = new Date().toISOString();
    bug.fixedBy = 'Test User';
    bug.fixCommit = '1234567890abcdef';
    bug.fixMessage = 'Fix test';
    return Promise.resolve(bug);
  });
  public reopenBug = jest.fn().mockImplementation((testIdentifier: string, test: TestResult, testFilePath: string): Promise<BugInfo> => {
    const bug = this.bugs[testIdentifier];
    if (!bug) {
      return Promise.reject(new Error(`No bug found for test: ${testIdentifier}`));
    }
    bug.status = 'open';
    bug.lastFailure = new Date().toISOString();
    bug.lastUpdate = new Date().toISOString();
    return Promise.resolve(bug);
  });
  public updateBug = jest.fn().mockImplementation((testIdentifier: string, test: TestResult, testFilePath: string): Promise<BugInfo> => {
    const bug = this.bugs[testIdentifier];
    if (!bug) {
      return Promise.reject(new Error(`No bug found for test: ${testIdentifier}`));
    }
    bug.lastFailure = new Date().toISOString();
    bug.lastUpdate = new Date().toISOString();
    return Promise.resolve(bug);
  });
  public getAllBugs = jest.fn().mockImplementation((): Promise<Record<string, BugInfo>> => Promise.resolve({ ...this.bugs }));

  /**
   * Set a bug for testing
   *
   * @param testIdentifier Test identifier
   * @param bug Bug information
   */
  public setBug(testIdentifier: string, bug: BugInfo): void {
    this.bugs[testIdentifier] = bug;
  }

  /**
   * Clear all bugs for testing
   */
  public clearBugs(): void {
    this.bugs = {};
  }
}

// Add a dummy test to avoid Jest error
describe('Bug Tracker Mock', () => {
  it('should provide a mock bug tracker', () => {
    const mockBugTracker = new MockBugTracker();
    expect(mockBugTracker).toBeDefined();
    expect(mockBugTracker.initialize).toBeDefined();
    expect(mockBugTracker.bugExists).toBeDefined();
    expect(mockBugTracker.getBug).toBeDefined();
    expect(mockBugTracker.createBug).toBeDefined();
    expect(mockBugTracker.closeBug).toBeDefined();
    expect(mockBugTracker.reopenBug).toBeDefined();
    expect(mockBugTracker.updateBug).toBeDefined();
    expect(mockBugTracker.getAllBugs).toBeDefined();
  });
});
