import { jest } from '@jest/globals';
import { AnalyticsPlugin } from '../../../plugins/examples/analytics-plugin';
import { mockFailingTest } from '../../mocks/test-results.mock';

// Mock console.log
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
});

describe('AnalyticsPlugin', () => {
  let plugin: AnalyticsPlugin;
  let options: { apiUrl: string; apiKey: string; projectId: string };

  beforeEach(() => {
    options = {
      apiUrl: 'https://analytics.example.com/api',
      apiKey: 'test-api-key',
      projectId: 'test-project'
    };

    plugin = new AnalyticsPlugin(options);
  });

  describe('constructor', () => {
    it('should create a plugin with the provided options', () => {
      expect(plugin.name).toBe('AnalyticsPlugin');
      // We can't directly test the private properties, but we can test the init method
      plugin.init({});
      expect(console.log).toHaveBeenCalledWith(`Analytics API URL: ${options.apiUrl}`);
      expect(console.log).toHaveBeenCalledWith(`Project ID: ${options.projectId}`);
    });
  });

  describe('init', () => {
    it('should log initialization information', () => {
      plugin.init({});

      expect(console.log).toHaveBeenCalledWith(`Initializing ${plugin.name} plugin`);
      expect(console.log).toHaveBeenCalledWith(`Analytics API URL: ${options.apiUrl}`);
      expect(console.log).toHaveBeenCalledWith(`Project ID: ${options.projectId}`);
    });
  });

  describe('beforeCreateIssue', () => {
    it('should track test failures', async () => {
      const testFilePath = '/path/to/test.ts';

      await plugin.beforeCreateIssue(mockFailingTest, testFilePath);

      expect(console.log).toHaveBeenCalledWith(`Tracking test failure: ${testFilePath}:${mockFailingTest.fullName}`);
      expect(console.log).toHaveBeenCalledWith('Failure count: 1');

      // Call again to test incrementing the failure count
      await plugin.beforeCreateIssue(mockFailingTest, testFilePath);

      expect(console.log).toHaveBeenCalledWith('Failure count: 2');
    });
  });

  describe('afterCloseIssue', () => {
    it('should track test fixes', async () => {
      const testFilePath = '/path/to/test.ts';
      const issueNumber = 123;

      await plugin.afterCloseIssue(mockFailingTest, testFilePath, issueNumber);

      expect(console.log).toHaveBeenCalledWith(`Tracking test fix: ${testFilePath}:${mockFailingTest.fullName}`);
      expect(console.log).toHaveBeenCalledWith(`Issue number: ${issueNumber}`);
    });
  });


});
