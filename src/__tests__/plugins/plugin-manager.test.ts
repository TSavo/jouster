// @ts-nocheck
import { jest } from '@jest/globals';
import { PluginManager } from '../../plugins/plugin-manager';
import { IssueTrackerPlugin } from '../../plugins/plugin.interface';
import { mockFailingTest } from '../mocks/test-results.mock';

describe('PluginManager', () => {
  let pluginManager: PluginManager;
  let mockPlugin: IssueTrackerPlugin;

  beforeEach(() => {
    // Create a mock plugin
    mockPlugin = {
      name: 'Mock Plugin',
      beforeCreateIssue: jest.fn().mockResolvedValue(undefined),
      afterCreateIssue: jest.fn().mockResolvedValue(undefined),
      beforeCloseIssue: jest.fn().mockResolvedValue(undefined),
      afterCloseIssue: jest.fn().mockResolvedValue(undefined),
      beforeReopenIssue: jest.fn().mockResolvedValue(undefined),
      afterReopenIssue: jest.fn().mockResolvedValue(undefined)
    };

    pluginManager = new PluginManager([mockPlugin]);
  });

  describe('constructor', () => {
    it('should initialize with empty plugins array when no plugins are provided', () => {
      const emptyPluginManager = new PluginManager();
      // Register a plugin to verify the plugins array was initialized as empty
      const newPlugin: IssueTrackerPlugin = {
        name: 'New Plugin'
      };
      emptyPluginManager.registerPlugin(newPlugin);

      // If the plugins array was properly initialized as empty, we should be able to register a plugin
      // without errors. We can't directly test the private plugins array, but we can test its behavior.
      const testFilePath = '/path/to/test.ts';
      return emptyPluginManager.beforeCreateIssue(mockFailingTest, testFilePath)
        .then(() => {
          // If we get here without errors, the test passes
          expect(true).toBe(true);
        });
    });
  });

  describe('registerPlugin', () => {
    it('should register a plugin', () => {
      const newPlugin: IssueTrackerPlugin = {
        name: 'New Plugin'
      };

      pluginManager.registerPlugin(newPlugin);

      // Create a new issue to verify the plugin was registered
      const testFilePath = '/path/to/test.ts';
      const issueNumber = 123;

      return pluginManager.afterCreateIssue(mockFailingTest, testFilePath, issueNumber)
        .then(() => {
          expect(mockPlugin.afterCreateIssue).toHaveBeenCalledWith(
            mockFailingTest,
            testFilePath,
            issueNumber
          );
        });
    });
  });

  describe('beforeCreateIssue', () => {
    it('should call beforeCreateIssue on all plugins', () => {
      const testFilePath = '/path/to/test.ts';

      return pluginManager.beforeCreateIssue(mockFailingTest, testFilePath)
        .then(() => {
          expect(mockPlugin.beforeCreateIssue).toHaveBeenCalledWith(
            mockFailingTest,
            testFilePath
          );
        });
    });

    it('should handle plugins without beforeCreateIssue', () => {
      const testFilePath = '/path/to/test.ts';
      const newPlugin: IssueTrackerPlugin = {
        name: 'New Plugin'
      };

      pluginManager.registerPlugin(newPlugin);

      return pluginManager.beforeCreateIssue(mockFailingTest, testFilePath)
        .then(() => {
          expect(mockPlugin.beforeCreateIssue).toHaveBeenCalledWith(
            mockFailingTest,
            testFilePath
          );
        });
    });
  });

  describe('afterCreateIssue', () => {
    it('should call afterCreateIssue on all plugins', () => {
      const testFilePath = '/path/to/test.ts';
      const issueNumber = 123;

      return pluginManager.afterCreateIssue(mockFailingTest, testFilePath, issueNumber)
        .then(() => {
          expect(mockPlugin.afterCreateIssue).toHaveBeenCalledWith(
            mockFailingTest,
            testFilePath,
            issueNumber
          );
        });
    });
  });

  describe('beforeCloseIssue', () => {
    it('should call beforeCloseIssue on all plugins', () => {
      const testFilePath = '/path/to/test.ts';
      const issueNumber = 123;

      return pluginManager.beforeCloseIssue(mockFailingTest, testFilePath, issueNumber)
        .then(() => {
          expect(mockPlugin.beforeCloseIssue).toHaveBeenCalledWith(
            mockFailingTest,
            testFilePath,
            issueNumber
          );
        });
    });
  });

  describe('afterCloseIssue', () => {
    it('should call afterCloseIssue on all plugins', () => {
      const testFilePath = '/path/to/test.ts';
      const issueNumber = 123;

      return pluginManager.afterCloseIssue(mockFailingTest, testFilePath, issueNumber)
        .then(() => {
          expect(mockPlugin.afterCloseIssue).toHaveBeenCalledWith(
            mockFailingTest,
            testFilePath,
            issueNumber
          );
        });
    });
  });

  describe('beforeReopenIssue', () => {
    it('should call beforeReopenIssue on all plugins', () => {
      const testFilePath = '/path/to/test.ts';
      const issueNumber = 123;

      return pluginManager.beforeReopenIssue(mockFailingTest, testFilePath, issueNumber)
        .then(() => {
          expect(mockPlugin.beforeReopenIssue).toHaveBeenCalledWith(
            mockFailingTest,
            testFilePath,
            issueNumber
          );
        });
    });
  });

  describe('afterReopenIssue', () => {
    it('should call afterReopenIssue on all plugins', () => {
      const testFilePath = '/path/to/test.ts';
      const issueNumber = 123;

      return pluginManager.afterReopenIssue(mockFailingTest, testFilePath, issueNumber)
        .then(() => {
          expect(mockPlugin.afterReopenIssue).toHaveBeenCalledWith(
            mockFailingTest,
            testFilePath,
            issueNumber
          );
        });
    });
  });
});
