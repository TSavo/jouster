// @ts-nocheck
import { jest } from '@jest/globals';

// Mock file system data
const mockFiles: Record<string, string> = {
  'test-issue-mapping.json': JSON.stringify({
    'test-identifier-1': {
      issueNumber: 123,
      status: 'open',
      lastFailure: '2023-01-01T00:00:00.000Z',
      lastUpdate: '2023-01-01T00:00:00.000Z'
    },
    'test-identifier-2': {
      issueNumber: 456,
      status: 'closed',
      lastFailure: '2023-01-01T00:00:00.000Z',
      lastUpdate: '2023-01-02T00:00:00.000Z',
      fixedBy: 'Test Author',
      fixCommit: '1234567890abcdef',
      fixMessage: 'Fix test'
    }
  }),
  'templates/issue-template.hbs': 'Issue template: {{testName}}',
  'templates/close-comment-template.hbs': 'Close comment: {{testName}}',
  'templates/reopen-comment-template.hbs': 'Reopen comment: {{testName}}',
  'test-file.ts': 'function testFunction() { return true; }',
  // Add template files for all possible paths
  'issue-template.hbs': 'Issue template: {{testName}}',
  'close-comment-template.hbs': 'Close comment: {{testName}}',
  'reopen-comment-template.hbs': 'Reopen comment: {{testName}}',
  'C:\\Users\\User\\Projects\\directorymonster\\GHITracker\\templates\\issue-template.hbs': 'Issue template: {{testName}}',
  'C:\\Users\\User\\Projects\\directorymonster\\GHITracker\\templates\\close-comment-template.hbs': 'Close comment: {{testName}}',
  'C:\\Users\\User\\Projects\\directorymonster\\GHITracker\\templates\\reopen-comment-template.hbs': 'Reopen comment: {{testName}}',
  'custom-templates\\issue-template.hbs': 'Issue template: {{testName}}',
  'custom-templates\\close-comment-template.hbs': 'Close comment: {{testName}}',
  'custom-templates\\reopen-comment-template.hbs': 'Reopen comment: {{testName}}'
};

// Mock fs module
export const existsSync = jest.fn().mockImplementation((path: string) => {
  return Object.keys(mockFiles).some(file => path.endsWith(file));
});

export const readFileSync = jest.fn().mockImplementation((path: string, options?: any) => {
  const fileName = Object.keys(mockFiles).find(file => path.endsWith(file));
  if (fileName) {
    return mockFiles[fileName];
  }
  throw new Error(`File not found: ${path}`);
});

export const writeFileSync = jest.fn();
export const unlinkSync = jest.fn();
export const mkdirSync = jest.fn();
export const renameSync = jest.fn();

// Export the mock
export default {
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  mkdirSync,
  renameSync
};

// Add a dummy test to avoid Jest error
describe('FS Mock', () => {
  it('should provide mock fs functions', () => {
    expect(existsSync).toBeDefined();
    expect(readFileSync).toBeDefined();
    expect(writeFileSync).toBeDefined();
    expect(unlinkSync).toBeDefined();
    expect(mkdirSync).toBeDefined();
    expect(renameSync).toBeDefined();
  });
});
