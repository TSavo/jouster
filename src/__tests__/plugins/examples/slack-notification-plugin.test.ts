import { jest } from '@jest/globals';
import { SlackNotificationPlugin } from '../../../plugins/examples/slack-notification-plugin';
import { mockFailingTest } from '../../mocks/test-results.mock';

// Mock console.log
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
});

describe('SlackNotificationPlugin', () => {
  let plugin: SlackNotificationPlugin;
  let options: { webhookUrl: string; channel: string };

  beforeEach(() => {
    options = {
      webhookUrl: 'https://hooks.slack.com/services/test',
      channel: '#test-failures'
    };

    plugin = new SlackNotificationPlugin(options);
  });

  describe('constructor', () => {
    it('should create a plugin with the provided options', () => {
      expect(plugin.name).toBe('SlackNotificationPlugin');
      // We can't directly test the private properties, but we can test the init method
      plugin.init({});
      expect(console.log).toHaveBeenCalledWith(`Slack webhook URL: ${options.webhookUrl}`);
      expect(console.log).toHaveBeenCalledWith(`Slack channel: ${options.channel}`);
    });
  });

  describe('init', () => {
    it('should log initialization information', () => {
      plugin.init({});

      expect(console.log).toHaveBeenCalledWith(`Initializing ${plugin.name} plugin`);
      expect(console.log).toHaveBeenCalledWith(`Slack webhook URL: ${options.webhookUrl}`);
      expect(console.log).toHaveBeenCalledWith(`Slack channel: ${options.channel}`);
    });
  });

  describe('afterCreateIssue', () => {
    it('should log notification information', async () => {
      const testFilePath = '/path/to/test.ts';
      const issueNumber = 123;

      await plugin.afterCreateIssue(mockFailingTest, testFilePath, issueNumber);

      expect(console.log).toHaveBeenCalledWith(`Sending Slack notification for new issue #${issueNumber}`);
      expect(console.log).toHaveBeenCalledWith(`Test: ${mockFailingTest.fullName}`);
      expect(console.log).toHaveBeenCalledWith(`File: ${testFilePath}`);
      expect(console.log).toHaveBeenCalledWith(`Channel: ${options.channel}`);
    });
  });

  describe('afterCloseIssue', () => {
    it('should log notification information', async () => {
      const testFilePath = '/path/to/test.ts';
      const issueNumber = 123;

      await plugin.afterCloseIssue(mockFailingTest, testFilePath, issueNumber);

      expect(console.log).toHaveBeenCalledWith(`Sending Slack notification for closed issue #${issueNumber}`);
      expect(console.log).toHaveBeenCalledWith(`Test: ${mockFailingTest.fullName}`);
      expect(console.log).toHaveBeenCalledWith(`File: ${testFilePath}`);
      expect(console.log).toHaveBeenCalledWith(`Channel: ${options.channel}`);
    });
  });
});
