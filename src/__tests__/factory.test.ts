// @ts-nocheck
import { jest } from '@jest/globals';
import path from 'path';
import defaultExport, {
  createGitHubClient,
  createStorageClient,
  createMappingStore,
  createTemplateManager,
  createPluginManager,
  createIssueManager,
  createIssueTrackerReporter,
  createBugTracker,
  getBaseDir
} from '../factory';
import { GitHubClient } from '../github/github-client';
import { GitHubRestClient } from '../github/github-rest-client';
import { JsonStorage } from '../storage/json-storage';
import { MappingStore } from '../storage/mapping-store';
import { TemplateManager } from '../templates/template-manager';
import { HookManager } from '../hooks/hook-manager';
import { PluginManager } from '../plugins/plugin-manager';
import { IssueManager } from '../issues/issue-manager';
import { IssueTrackerReporter } from '../jest/issue-tracker-reporter';
import { IssueTrackerPlugin } from '../plugins/plugin.interface';
import { GitHubBugTracker } from '../trackers/github/github-bug-tracker';
import { FileBugTracker } from '../trackers/file/file-bug-tracker';

// Mock fs and child_process modules
jest.mock('fs', () => require('./mocks/fs.mock'), { virtual: true });
jest.mock('child_process', () => require('./mocks/child-process.mock'), { virtual: true });

describe('factory', () => {
  describe('createGitHubClient', () => {
    it('should create a GitHub client with default labels', () => {
      const client = createGitHubClient();

      expect(client).toBeInstanceOf(GitHubClient);
    });

    it('should create a GitHub client with custom labels', () => {
      const client = createGitHubClient({ defaultLabels: ['custom-label'] });

      expect(client).toBeInstanceOf(GitHubClient);
    });

    it('should use a provided GitHub client', () => {
      const mockClient = { isGitHubCliAvailable: jest.fn() } as any;
      const client = createGitHubClient({ githubClient: mockClient });

      expect(client).toBe(mockClient);
    });

    it('should create a GitHub REST client when githubUseRest is true', () => {
      const client = createGitHubClient({
        githubUseRest: true,
        githubToken: 'test-token',
        githubRepo: 'owner/repo'
      });

      expect(client).toBeInstanceOf(GitHubRestClient);
    });

    it('should throw an error when githubUseRest is true but token is missing', () => {
      expect(() => {
        createGitHubClient({
          githubUseRest: true,
          githubRepo: 'owner/repo'
        });
      }).toThrow('GitHub token and repository are required when using REST API');
    });

    it('should throw an error when githubUseRest is true but repo is missing', () => {
      expect(() => {
        createGitHubClient({
          githubUseRest: true,
          githubToken: 'test-token'
        });
      }).toThrow('GitHub token and repository are required when using REST API');
    });

    it('should use githubLabels if provided', () => {
      const client = createGitHubClient({
        githubLabels: ['github-label'],
        defaultLabels: ['default-label']
      });

      expect(client).toBeInstanceOf(GitHubClient);
      // We can't easily test the labels since they're private, but we can verify the type
    });
  });

  describe('createStorageClient', () => {
    it('should create a JSON storage client with default path', () => {
      const client = createStorageClient();

      expect(client).toBeInstanceOf(JsonStorage);
    });

    it('should create a JSON storage client with custom path', () => {
      const client = createStorageClient({ databasePath: 'custom-path.json' });

      expect(client).toBeInstanceOf(JsonStorage);
    });

    it('should use a provided storage client', () => {
      const mockClient = { getMapping: jest.fn() } as any;
      const client = createStorageClient({ storageClient: mockClient });

      expect(client).toBe(mockClient);
    });
  });

  describe('createMappingStore', () => {
    it('should create a mapping store', () => {
      const store = createMappingStore();

      expect(store).toBeInstanceOf(MappingStore);
    });
  });

  describe('createTemplateManager', () => {
    it('should create a template manager with default path', () => {
      const manager = createTemplateManager();

      expect(manager).toBeInstanceOf(TemplateManager);
    });

    it('should create a template manager with custom path', () => {
      const manager = createTemplateManager({ templateDir: 'custom-templates' });

      expect(manager).toBeInstanceOf(TemplateManager);
    });

    it('should create a template manager with hooks', () => {
      // Create a mock hook
      const mockHook = {
        name: 'mockHook',
        priority: 0,
        processIssueData: jest.fn()
      };

      // Mock the TemplateManager class
      const originalTemplateManager = TemplateManager;
      const mockRegisterHook = jest.fn();
      const mockTemplateManager = jest.fn().mockImplementation(() => ({
        registerHook: mockRegisterHook
      }));

      // Replace the TemplateManager class with our mock
      (TemplateManager as any) = mockTemplateManager;

      try {
        // Create a template manager with hooks
        const options = {
          hooks: [mockHook]
        };

        const manager = createTemplateManager(options);

        // Verify that the template manager was created
        expect(mockTemplateManager).toHaveBeenCalled();

        // Verify that registerHook was called with the mock hook
        expect(mockRegisterHook).toHaveBeenCalledWith(mockHook);
      } finally {
        // Restore the original TemplateManager class
        (TemplateManager as any) = originalTemplateManager;
      }
    });

    it('should create a template manager with empty hooks array', () => {
      // Create a template manager with empty hooks array
      const manager = createTemplateManager({
        config: {
          hooks: []
        }
      });

      // Verify that the template manager was created
      expect(manager).toBeInstanceOf(TemplateManager);
    });

    it('should create a template manager with undefined hooks', () => {
      // Create a template manager with undefined hooks
      const manager = createTemplateManager({
        config: {}
      });

      // Verify that the template manager was created
      expect(manager).toBeInstanceOf(TemplateManager);
    });

    it('should use a provided template manager', () => {
      const mockManager = { generateIssueBody: jest.fn() } as any;
      const manager = createTemplateManager({ templateManager: mockManager });

      expect(manager).toBe(mockManager);
    });
  });

  describe('createPluginManager', () => {
    it('should create a plugin manager with no plugins', () => {
      const manager = createPluginManager();

      expect(manager).toBeInstanceOf(PluginManager);
    });

    it('should create a plugin manager with plugins', () => {
      const mockPlugin: IssueTrackerPlugin = { name: 'Mock Plugin' };
      const manager = createPluginManager({ plugins: [mockPlugin] });

      expect(manager).toBeInstanceOf(PluginManager);
    });
  });

  describe('createIssueManager', () => {
    it('should create an issue manager', () => {
      const manager = createIssueManager();

      expect(manager).toBeInstanceOf(IssueManager);
    });
  });

  describe('createIssueTrackerReporter', () => {
    it('should create an issue tracker reporter', () => {
      const reporter = createIssueTrackerReporter({}, {});

      expect(reporter).toBeInstanceOf(IssueTrackerReporter);
    });

    it('should use environment variables for configuration', () => {
      process.env.GENERATE_ISSUES = 'true';
      process.env.TRACK_ISSUES = 'true';

      const reporter = createIssueTrackerReporter({}, {});

      expect(reporter).toBeInstanceOf(IssueTrackerReporter);

      // Clean up
      delete process.env.GENERATE_ISSUES;
      delete process.env.TRACK_ISSUES;
    });
  });

  describe('createBugTracker', () => {
    it('should create a GitHub bug tracker by default', () => {
      const bugTracker = createBugTracker();

      expect(bugTracker).toBeInstanceOf(GitHubBugTracker);
    });

    it('should create a GitHub bug tracker when type is github', () => {
      const bugTracker = createBugTracker({ trackerType: 'github' });

      expect(bugTracker).toBeInstanceOf(GitHubBugTracker);
    });

    it('should create a file bug tracker when type is file', () => {
      const bugTracker = createBugTracker({ trackerType: 'file' });

      expect(bugTracker).toBeInstanceOf(FileBugTracker);
    });

    it('should use a provided bug tracker', () => {
      const mockBugTracker = { initialize: jest.fn() } as any;
      const bugTracker = createBugTracker({ bugTracker: mockBugTracker });

      expect(bugTracker).toBe(mockBugTracker);
    });

    it('should create a file bug tracker with custom bugs directory', () => {
      const bugTracker = createBugTracker({ trackerType: 'file', bugsDir: 'custom-bugs' });

      expect(bugTracker).toBeInstanceOf(FileBugTracker);
    });
  });

  describe('getBaseDir', () => {
    it('should return the provided bugs directory', () => {
      const config = { bugsDir: '/custom/bugs/dir' };
      const result = getBaseDir(config);
      expect(result).toBe('/custom/bugs/dir');
    });

    it('should return the default bugs directory when not provided', () => {
      const result = getBaseDir();
      expect(result).toBe(path.join(process.cwd(), 'bugs'));
    });

    it('should return the default bugs directory when config is null', () => {
      const result = getBaseDir(null);
      expect(result).toBe(path.join(process.cwd(), 'bugs'));
    });
  });

  describe('default export', () => {
    it('should be the createIssueTrackerReporter function', () => {
      expect(defaultExport).toBe(createIssueTrackerReporter);
    });
  });
});
